/* Main validation function */
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
    v_tipo_refeicao RECORD;
    v_turno RECORD;
    v_validation_result JSONB;
BEGIN
    /* Set configuration for RLS */
    PERFORM set_config('voucher.validated', 'true', true);
    
    v_hora_atual := CURRENT_TIME;

    /* Find user and validate basic conditions */
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
        PERFORM set_config('voucher.validated', 'false', true);
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Voucher inválido ou usuário suspenso'
        );
    END IF;

    /* Get and validate meal type */
    SELECT * INTO v_tipo_refeicao
    FROM tipos_refeicao
    WHERE id = p_tipo_refeicao_id
    AND ativo = true;

    IF NOT FOUND THEN
        PERFORM set_config('voucher.validated', 'false', true);
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Tipo de refeição inválido ou inativo'
        );
    END IF;

    /* Get and validate shift */
    SELECT * INTO v_turno
    FROM turnos
    WHERE id = v_turno_id
    AND ativo = true;

    IF NOT FOUND THEN
        PERFORM set_config('voucher.validated', 'false', true);
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Turno inválido ou inativo'
        );
    END IF;

    /* Validate time and shift */
    v_validation_result := validate_voucher_time_and_shift(v_hora_atual, v_tipo_refeicao, v_turno);
    IF NOT (v_validation_result->>'success')::boolean THEN
        PERFORM set_config('voucher.validated', 'false', true);
        RETURN v_validation_result;
    END IF;

    /* Validate usage limits */
    v_validation_result := validate_voucher_usage_limits(v_usuario_id);
    IF NOT (v_validation_result->>'success')::boolean THEN
        PERFORM set_config('voucher.validated', 'false', true);
        RETURN v_validation_result;
    END IF;

    /* Register usage */
    INSERT INTO uso_voucher (
        usuario_id,
        tipo_refeicao_id,
        usado_em
    ) VALUES (
        v_usuario_id,
        p_tipo_refeicao_id,
        CURRENT_TIMESTAMP
    );

    /* Reset configuration */
    PERFORM set_config('voucher.validated', 'false', true);

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Voucher validado com sucesso'
    );

EXCEPTION
    WHEN OTHERS THEN
        PERFORM set_config('voucher.validated', 'false', true);
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;