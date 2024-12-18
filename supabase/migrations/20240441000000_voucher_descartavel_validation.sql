-- Drop existing function if exists
DROP FUNCTION IF EXISTS validate_disposable_voucher CASCADE;

-- Create function for disposable voucher validation
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
    v_tipo_refeicao RECORD;
BEGIN
    -- Get meal type information first
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

    -- Try to find and lock a valid disposable voucher
    SELECT *
    INTO v_voucher
    FROM vouchers_descartaveis vd
    WHERE vd.codigo = p_codigo
    AND vd.tipo_refeicao_id = p_tipo_refeicao_id
    AND NOT vd.usado
    AND CURRENT_DATE <= vd.data_expiracao::date
    FOR UPDATE SKIP LOCKED;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Voucher descartável não encontrado ou já utilizado'
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

    -- Mark voucher as used
    UPDATE vouchers_descartaveis
    SET usado = true,
        data_uso = CURRENT_TIMESTAMP
    WHERE id = v_voucher.id
    AND NOT usado;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Voucher já foi utilizado'
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Voucher descartável validado com sucesso'
    );
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION validate_disposable_voucher FROM PUBLIC;
GRANT EXECUTE ON FUNCTION validate_disposable_voucher TO authenticated;
GRANT EXECUTE ON FUNCTION validate_disposable_voucher TO anon;