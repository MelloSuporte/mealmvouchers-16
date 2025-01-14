-- Drop existing policies and function
DROP POLICY IF EXISTS "vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_update_policy" ON vouchers_descartaveis;
DROP FUNCTION IF EXISTS validate_disposable_voucher;

-- Enable RLS
ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;

-- Ensure usado_em is timestamp with time zone
DO $$ 
BEGIN
    ALTER TABLE vouchers_descartaveis 
    ALTER COLUMN usado_em TYPE TIMESTAMP WITH TIME ZONE USING 
    CASE 
        WHEN usado_em::text::boolean THEN CURRENT_TIMESTAMP 
        ELSE NULL 
    END;
EXCEPTION
    WHEN others THEN
        NULL;
END $$;

-- Create select policy with proper validation
CREATE POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis
    FOR SELECT TO authenticated, anon
    USING (
        -- Voucher não usado e dentro da validade
        usado_em IS NULL 
        AND data_uso IS NULL
        AND CURRENT_DATE <= data_expiracao::date
        AND codigo IS NOT NULL
    );

-- Create update policy with proper validation
CREATE POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis
    FOR UPDATE TO authenticated, anon
    USING (
        -- Voucher não usado e dentro da validade
        usado_em IS NULL 
        AND data_uso IS NULL
        AND CURRENT_DATE <= data_expiracao::date
    )
    WITH CHECK (
        -- Garantir que o voucher está sendo marcado como usado
        usado_em IS NOT NULL
        AND data_uso IS NOT NULL
    );

-- Create function to validate voucher with better error handling
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
    v_tipo_refeicao RECORD;
BEGIN
    -- Buscar tipo de refeição primeiro
    SELECT *
    INTO v_tipo_refeicao
    FROM tipos_refeicao
    WHERE id = p_tipo_refeicao_id
    AND ativo = true;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Tipo de refeição inválido ou inativo'
        );
    END IF;

    -- Verificar horário da refeição
    IF NOT (CURRENT_TIME BETWEEN v_tipo_refeicao.horario_inicio 
        AND (v_tipo_refeicao.horario_fim + (v_tipo_refeicao.minutos_tolerancia || ' minutes')::INTERVAL)) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Esta refeição só pode ser utilizada entre %s e %s',
                v_tipo_refeicao.horario_inicio::TEXT,
                v_tipo_refeicao.horario_fim::TEXT
            )
        );
    END IF;

    -- Buscar voucher válido com lock
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

    -- Marcar voucher como usado
    UPDATE vouchers_descartaveis
    SET 
        usado_em = CURRENT_TIMESTAMP,
        data_uso = CURRENT_TIMESTAMP
    WHERE id = v_voucher.id
    AND usado_em IS NULL
    AND data_uso IS NULL;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Voucher já foi utilizado'
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Voucher validado com sucesso',
        'tipo_refeicao', jsonb_build_object(
            'id', v_tipo_refeicao.id,
            'nome', v_tipo_refeicao.nome
        )
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