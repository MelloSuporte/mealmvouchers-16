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

-- Create update policy
CREATE POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis
    FOR UPDATE TO authenticated, anon
    USING (
        usado_em IS NULL 
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
        usado_em IS NOT NULL
    );

-- Create function to validate voucher
CREATE OR REPLACE FUNCTION validate_disposable_voucher(
    p_codigo VARCHAR(4),
    p_tipo_refeicao_id UUID
) RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_voucher RECORD;
BEGIN
    -- Find and validate voucher
    SELECT *
    INTO v_voucher
    FROM vouchers_descartaveis vd
    WHERE vd.codigo = p_codigo
    AND vd.tipo_refeicao_id = p_tipo_refeicao_id
    AND vd.usado_em IS NULL
    AND CURRENT_DATE <= vd.data_expiracao::date
    AND EXISTS (
        SELECT 1 FROM tipos_refeicao tr
        WHERE tr.id = vd.tipo_refeicao_id
        AND tr.ativo = true
        AND CURRENT_TIME BETWEEN tr.horario_inicio 
        AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
    );

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Voucher inválido ou fora do horário permitido'
        );
    END IF;

    -- Mark voucher as used
    UPDATE vouchers_descartaveis
    SET usado_em = CURRENT_TIMESTAMP
    WHERE id = v_voucher.id
    AND usado_em IS NULL;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Voucher já utilizado'
        );
    END IF;

    -- Register usage
    INSERT INTO uso_voucher (
        voucher_descartavel_id,
        tipo_refeicao_id,
        usado_em
    ) VALUES (
        v_voucher.id,
        p_tipo_refeicao_id,
        CURRENT_TIMESTAMP
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Voucher validado com sucesso'
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION validate_disposable_voucher TO authenticated;
GRANT EXECUTE ON FUNCTION validate_disposable_voucher TO anon;

-- Add helpful comments
COMMENT ON POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis IS 
'Permite visualizar apenas vouchers válidos, não utilizados e dentro do horário permitido';

COMMENT ON POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis IS 
'Permite apenas marcar vouchers como usados quando dentro do horário permitido';

COMMENT ON FUNCTION validate_disposable_voucher IS 
'Valida e registra o uso de vouchers descartáveis com todas as regras de negócio';