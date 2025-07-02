-- Drop existing function if exists
DROP FUNCTION IF EXISTS validate_and_use_voucher CASCADE;
DROP FUNCTION IF EXISTS validate_meal_time CASCADE;

-- Create function to validate meal time
CREATE OR REPLACE FUNCTION validate_meal_time(
    p_tipo_refeicao_id UUID
) RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_horario_inicio TIME;
    v_horario_fim TIME;
    v_tolerancia INTEGER;
    v_current_time TIME;
BEGIN
    -- Get meal type information
    SELECT 
        horario_inicio,
        horario_fim,
        COALESCE(minutos_tolerancia, 0)
    INTO 
        v_horario_inicio,
        v_horario_fim,
        v_tolerancia
    FROM tipos_refeicao
    WHERE id = p_tipo_refeicao_id
    AND ativo = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tipo de refeição inválido ou inativo';
    END IF;

    v_current_time := CURRENT_TIME;

    -- Check if current time is within allowed range (including tolerance)
    RETURN v_current_time BETWEEN v_horario_inicio 
        AND v_horario_fim + (v_tolerancia || ' minutes')::INTERVAL;
END;
$$;

-- Create complete validate_and_use_voucher function
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
    v_cpf VARCHAR(11);
    v_refeicoes_dia INTEGER;
    v_ultima_refeicao TIMESTAMP;
    v_disposable_voucher RECORD;
BEGIN
    -- Validate meal time first
    IF NOT validate_meal_time(p_tipo_refeicao_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Fora do horário permitido para esta refeição'
        );
    END IF;

    -- Try to find disposable voucher first
    SELECT *
    INTO v_disposable_voucher
    FROM vouchers_descartaveis
    WHERE codigo = p_codigo
    AND tipo_refeicao_id = p_tipo_refeicao_id
    AND usado_em IS NULL
    AND CURRENT_DATE <= data_expiracao::date;

    IF FOUND THEN
        -- Update disposable voucher as used
        UPDATE vouchers_descartaveis
        SET usado_em = CURRENT_TIMESTAMP
        WHERE id = v_disposable_voucher.id;

        -- Register usage in uso_voucher
        INSERT INTO uso_voucher (
            voucher_descartavel_id,
            tipo_refeicao_id,
            usado_em,
            observacao
        ) VALUES (
            v_disposable_voucher.id,
            p_tipo_refeicao_id,
            CURRENT_TIMESTAMP,
            'Voucher descartável utilizado'
        );

        RETURN jsonb_build_object(
            'success', true,
            'message', 'Voucher descartável validado com sucesso',
            'tipo', 'descartavel'
        );
    END IF;

    -- If not found as disposable, try common voucher
    SELECT u.id, u.turno_id, u.empresa_id, u.cpf
    INTO v_usuario_id, v_turno_id, v_empresa_id, v_cpf
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

    -- Check if user already used this meal type today
    SELECT COUNT(*)
    INTO v_refeicoes_dia
    FROM uso_voucher
    WHERE usuario_id = v_usuario_id
    AND tipo_refeicao_id = p_tipo_refeicao_id
    AND DATE(usado_em) = CURRENT_DATE;

    IF v_refeicoes_dia > 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Este tipo de refeição já foi utilizado hoje'
        );
    END IF;

    -- Check daily limit (max 3 meals per day)
    SELECT COUNT(*), MAX(usado_em)
    INTO v_refeicoes_dia, v_ultima_refeicao
    FROM uso_voucher
    WHERE usuario_id = v_usuario_id
    AND DATE(usado_em) = CURRENT_DATE;

    IF v_refeicoes_dia >= 3 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Limite diário de refeições atingido (máximo 3)'
        );
    END IF;

    -- Check minimum interval (3 hours between meals)
    IF v_ultima_refeicao IS NOT NULL AND 
       v_ultima_refeicao + INTERVAL '3 hours' > CURRENT_TIMESTAMP THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Intervalo mínimo entre refeições não respeitado (3 horas)'
        );
    END IF;

    -- Register usage for common voucher
    INSERT INTO uso_voucher (
        usuario_id,
        tipo_refeicao_id,
        usado_em,
        cpf,
        observacao
    ) VALUES (
        v_usuario_id,
        p_tipo_refeicao_id,
        CURRENT_TIMESTAMP,
        v_cpf,
        'Voucher comum utilizado'
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Voucher comum validado com sucesso',
        'usuario_id', v_usuario_id,
        'tipo', 'comum'
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Grant necessary permissions
REVOKE ALL ON FUNCTION validate_meal_time(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION validate_meal_time(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_meal_time(UUID) TO anon;

REVOKE ALL ON FUNCTION validate_and_use_voucher(VARCHAR, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION validate_and_use_voucher(VARCHAR, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_and_use_voucher(VARCHAR, UUID) TO anon;

-- Add helpful comments
COMMENT ON FUNCTION validate_meal_time IS 'Valida se o horário atual está dentro do permitido para o tipo de refeição';
COMMENT ON FUNCTION validate_and_use_voucher IS 'Valida e registra o uso de vouchers (descartáveis ou comuns) com todas as regras de negócio';