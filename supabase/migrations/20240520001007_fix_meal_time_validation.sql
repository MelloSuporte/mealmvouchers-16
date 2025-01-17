-- Drop existing function if exists
DROP FUNCTION IF EXISTS validate_meal_time;

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

-- Update validate_and_use_voucher to use the new validation
CREATE OR REPLACE FUNCTION validate_and_use_voucher(
    p_codigo VARCHAR(4),
    p_tipo_refeicao_id UUID
) RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_result BOOLEAN;
BEGIN
    -- Validate meal time first
    IF NOT validate_meal_time(p_tipo_refeicao_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Fora do horário permitido para esta refeição'
        );
    END IF;

    -- Continue with existing validation logic
    -- Find user by voucher code
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

    -- Check daily limit
    SELECT COUNT(*), MAX(usado_em)
    INTO v_refeicoes_dia, v_ultima_refeicao
    FROM uso_voucher
    WHERE usuario_id = v_usuario_id
    AND DATE(usado_em) = CURRENT_DATE;

    IF v_refeicoes_dia >= 3 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Limite diário de refeições atingido'
        );
    END IF;

    -- Check minimum interval
    IF v_ultima_refeicao IS NOT NULL AND 
       v_ultima_refeicao + INTERVAL '3 hours' > CURRENT_TIMESTAMP THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Intervalo mínimo entre refeições não respeitado'
        );
    END IF;

    -- Register usage
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
        'Voucher utilizado'
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Voucher validado com sucesso',
        'usuario_id', v_usuario_id
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
