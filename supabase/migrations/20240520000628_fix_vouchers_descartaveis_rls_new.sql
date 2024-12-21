-- Drop existing policies
DROP POLICY IF EXISTS "vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_update_policy" ON vouchers_descartaveis;

-- Enable RLS
ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;

-- Create select policy with proper validation
CREATE POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis
    FOR SELECT TO authenticated, anon
    USING (
        -- Voucher não usado e dentro da validade
        usado_em IS NULL 
        AND data_uso IS NULL
        AND CURRENT_DATE <= data_expiracao::date
        AND codigo IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
    );

-- Create update policy with proper validation
CREATE POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis
    FOR UPDATE TO authenticated, anon
    USING (
        -- Voucher não usado e dentro da validade
        usado_em IS NULL 
        AND data_uso IS NULL
        AND CURRENT_DATE <= data_expiracao::date
        AND EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
    )
    WITH CHECK (
        -- Garantir que o voucher está sendo marcado como usado
        usado_em IS NOT NULL
        AND data_uso IS NOT NULL
    );

-- Create function to validate voucher
CREATE OR REPLACE FUNCTION validate_disposable_voucher(
    p_codigo VARCHAR(4),
    p_tipo_refeicao_id UUID
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_voucher RECORD;
BEGIN
    -- Buscar voucher válido
    SELECT *
    INTO v_voucher
    FROM vouchers_descartaveis
    WHERE codigo = p_codigo
    AND tipo_refeicao_id = p_tipo_refeicao_id
    AND usado_em IS NULL
    AND data_uso IS NULL
    AND CURRENT_DATE <= data_expiracao::date
    FOR UPDATE SKIP LOCKED;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Voucher não encontrado ou já utilizado'
        );
    END IF;

    -- Verificar horário da refeição
    IF NOT EXISTS (
        SELECT 1 FROM tipos_refeicao tr
        WHERE tr.id = v_voucher.tipo_refeicao_id
        AND tr.ativo = true
        AND CURRENT_TIME BETWEEN tr.horario_inicio 
        AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Fora do horário permitido para esta refeição'
        );
    END IF;

    -- Marcar voucher como usado
    UPDATE vouchers_descartaveis
    SET 
        usado_em = CURRENT_TIMESTAMP,
        data_uso = CURRENT_TIMESTAMP
    WHERE id = v_voucher.id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Voucher validado com sucesso'
    );
END;
$$;

-- Grant necessary permissions
GRANT SELECT, UPDATE ON vouchers_descartaveis TO anon;
GRANT SELECT ON tipos_refeicao TO anon;
GRANT EXECUTE ON FUNCTION validate_disposable_voucher TO anon;

-- Add helpful comments
COMMENT ON POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis IS 
'Permite visualizar apenas vouchers válidos, não utilizados e dentro do horário permitido';

COMMENT ON POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis IS 
'Permite apenas marcar vouchers como usados quando dentro do horário permitido';

COMMENT ON FUNCTION validate_disposable_voucher IS 
'Valida e marca como usado um voucher descartável';