-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS validate_and_use_voucher CASCADE;
DROP FUNCTION IF EXISTS validate_common_voucher CASCADE;
DROP FUNCTION IF EXISTS check_meal_time_and_shift CASCADE;

-- Create function to check meal time and shift
CREATE OR REPLACE FUNCTION check_meal_time_and_shift(
    p_tipo_refeicao_id UUID,
    p_turno_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_current_time TIME;
    v_is_valid BOOLEAN;
BEGIN
    v_current_time := CURRENT_TIME;
    
    SELECT EXISTS (
        SELECT 1 
        FROM tipos_refeicao tr
        JOIN turnos t ON true
        WHERE tr.id = p_tipo_refeicao_id
        AND t.id = p_turno_id
        AND tr.ativo = true
        AND t.ativo = true
        AND v_current_time BETWEEN tr.horario_inicio 
        AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
    ) INTO v_is_valid;
    
    RETURN v_is_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Main function to validate and use voucher
CREATE OR REPLACE FUNCTION validate_and_use_voucher(
    p_codigo VARCHAR(4),
    p_tipo_refeicao_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_usuario_id UUID;
    v_turno_id UUID;
    v_empresa_id UUID;
    v_refeicoes_dia INTEGER;
    v_ultima_refeicao TIMESTAMP;
BEGIN
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

    -- Check meal time and shift
    IF NOT check_meal_time_and_shift(p_tipo_refeicao_id, v_turno_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Horário não permitido para esta refeição'
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION validate_and_use_voucher(VARCHAR, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_and_use_voucher(VARCHAR, UUID) TO anon;
GRANT EXECUTE ON FUNCTION check_meal_time_and_shift(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_meal_time_and_shift(UUID, UUID) TO anon;

-- Add helpful comments
COMMENT ON FUNCTION validate_and_use_voucher IS 'Validates and uses voucher with all business rules';
COMMENT ON FUNCTION check_meal_time_and_shift IS 'Validates if the meal time is valid for the given shift';