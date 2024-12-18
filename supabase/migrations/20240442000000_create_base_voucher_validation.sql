-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS validate_voucher_time_and_shift CASCADE;
DROP FUNCTION IF EXISTS validate_voucher_usage_limits CASCADE;
DROP FUNCTION IF EXISTS validate_and_use_voucher CASCADE;

-- Create base validation function
CREATE OR REPLACE FUNCTION validate_voucher_base(
    p_codigo VARCHAR(4),
    p_tipo_refeicao_id UUID
) RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_tipo_refeicao RECORD;
BEGIN
    -- Get meal type information
    SELECT * INTO v_tipo_refeicao
    FROM tipos_refeicao
    WHERE id = p_tipo_refeicao_id
    AND ativo = true;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Tipo de refeição inválido ou inativo'
        );
    END IF;

    -- Validate meal time
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

    RETURN jsonb_build_object('success', true);
END;
$$;