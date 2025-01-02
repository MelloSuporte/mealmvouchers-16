-- Main validation and usage function
CREATE OR REPLACE FUNCTION validate_and_use_voucher(
    p_codigo VARCHAR(4),
    p_tipo_refeicao_id UUID
) RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_usuario_id UUID;
    v_turno_id UUID;
    v_empresa_id UUID;
    v_hora_atual TIME;
    v_validation_result JSONB;
BEGIN
    v_hora_atual := CURRENT_TIME;

    -- Find user and validate basic conditions
    SELECT u.id, u.turno_id, u.empresa_id
    INTO v_usuario_id, v_turno_id, v_empresa_id
    FROM usuarios u
    WHERE u.voucher = p_codigo
    AND NOT u.suspenso
    AND EXISTS (
        SELECT 1 FROM empresas e
        WHERE e.id = u.empresa_id
        AND e.ativo = true
    );

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Voucher inválido ou usuário suspenso'
        );
    END IF;

    -- Validate time and shift
    v_validation_result := validate_voucher_time_and_shift(v_hora_atual, p_tipo_refeicao_id, v_turno_id);
    IF NOT (v_validation_result->>'success')::boolean THEN
        RETURN v_validation_result;
    END IF;

    -- Validate usage limits
    v_validation_result := validate_voucher_usage_limits(v_usuario_id);
    IF NOT (v_validation_result->>'success')::boolean THEN
        RETURN v_validation_result;
    END IF;

    -- Register usage
    INSERT INTO uso_voucher (
        usuario_id,
        tipo_refeicao_id,
        usado_em
    ) VALUES (
        v_usuario_id,
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

-- Set proper permissions
REVOKE ALL ON FUNCTION validate_and_use_voucher(VARCHAR, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION validate_and_use_voucher(VARCHAR, UUID) TO authenticated, anon;