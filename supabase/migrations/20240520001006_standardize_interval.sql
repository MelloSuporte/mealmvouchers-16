-- Drop existing functions that we'll update
DROP FUNCTION IF EXISTS validate_and_use_voucher CASCADE;
DROP FUNCTION IF EXISTS validate_voucher_usage_limits CASCADE;
DROP FUNCTION IF EXISTS check_voucher_comum_rules CASCADE;
DROP FUNCTION IF EXISTS check_voucher_extra_rules CASCADE;

-- Recreate main validation function with 1 hour interval
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
    v_cpf VARCHAR;
    v_result JSONB;
    v_refeicoes_dia INTEGER;
    v_ultima_refeicao TIMESTAMP;
BEGIN
    -- Find user by voucher code
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

    -- Check minimum interval (1 hour)
    IF v_ultima_refeicao IS NOT NULL AND 
       v_ultima_refeicao + INTERVAL '1 hour' > CURRENT_TIMESTAMP THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Intervalo mínimo entre refeições não respeitado (1 hora)'
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

-- Recreate usage limits validation with 1 hour interval
CREATE OR REPLACE FUNCTION validate_voucher_usage_limits(
    p_usuario_id UUID
) RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_refeicoes_dia INTEGER;
    v_ultima_refeicao TIMESTAMP;
BEGIN
    -- Check daily limit
    SELECT COUNT(*), MAX(usado_em)
    INTO v_refeicoes_dia, v_ultima_refeicao
    FROM uso_voucher
    WHERE usuario_id = p_usuario_id
    AND DATE(usado_em) = CURRENT_DATE;

    IF v_refeicoes_dia >= 3 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Limite diário de refeições atingido'
        );
    END IF;

    -- Check minimum interval (1 hour)
    IF v_ultima_refeicao IS NOT NULL AND 
       v_ultima_refeicao + INTERVAL '1 hour' > CURRENT_TIMESTAMP THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Intervalo mínimo entre refeições não respeitado (1 hora)'
        );
    END IF;

    RETURN jsonb_build_object('success', true);
END;
$$;

-- Update common voucher rules with 1 hour interval
CREATE OR REPLACE FUNCTION check_voucher_comum_rules(
    p_usuario_id UUID,
    p_tipo_refeicao_id UUID
) RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_refeicoes_periodo INT;
    v_refeicoes_dia INT;
    v_ultima_refeicao TIMESTAMP;
    v_empresa_ativa BOOLEAN;
    v_turno_valido BOOLEAN;
BEGIN
    -- Verificar empresa ativa
    SELECT e.ativo INTO v_empresa_ativa
    FROM usuarios u
    JOIN empresas e ON u.empresa_id = e.id
    WHERE u.id = p_usuario_id;

    IF NOT v_empresa_ativa THEN
        RAISE EXCEPTION 'Empresa do usuário não está ativa';
    END IF;

    -- Verificar turno do usuário
    SELECT EXISTS (
        SELECT 1 FROM usuarios u
        JOIN turnos t ON u.turno = t.tipo_turno
        WHERE u.id = p_usuario_id
        AND t.ativo = true
    ) INTO v_turno_valido;

    IF NOT v_turno_valido THEN
        RAISE EXCEPTION 'Turno do usuário inválido ou inativo';
    END IF;

    -- Verificar refeições no período (últimas 4 horas)
    SELECT COUNT(*)
    INTO v_refeicoes_periodo
    FROM uso_voucher
    WHERE usuario_id = p_usuario_id
    AND usado_em >= NOW() - INTERVAL '4 hours';

    IF v_refeicoes_periodo >= 2 THEN
        RAISE EXCEPTION 'Limite de refeições por período atingido (máximo 2)';
    END IF;

    -- Verificar refeições no dia
    SELECT COUNT(*), MAX(usado_em)
    INTO v_refeicoes_dia, v_ultima_refeicao
    FROM uso_voucher
    WHERE usuario_id = p_usuario_id
    AND DATE(usado_em) = CURRENT_DATE;

    IF v_refeicoes_dia >= 3 THEN
        RAISE EXCEPTION 'Limite diário de refeições atingido (máximo 3)';
    END IF;

    -- Verificar intervalo mínimo (1 hora)
    IF v_ultima_refeicao IS NOT NULL AND 
       v_ultima_refeicao + INTERVAL '1 hour' > CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'Intervalo mínimo entre refeições não respeitado (1 hora)';
    END IF;

    RETURN TRUE;
END;
$$;

-- Update extra voucher rules with 1 hour interval
CREATE OR REPLACE FUNCTION check_voucher_extra_rules(
    p_voucher_id UUID,
    p_usuario_id UUID
) RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_refeicoes_periodo INT;
    v_refeicoes_dia INT;
    v_ultima_refeicao TIMESTAMP;
    v_empresa_ativa BOOLEAN;
    v_dentro_horario BOOLEAN;
    v_turno_valido BOOLEAN;
BEGIN
    -- Verificar empresa ativa
    SELECT e.ativo INTO v_empresa_ativa
    FROM usuarios u
    JOIN empresas e ON u.empresa_id = e.id
    WHERE u.id = p_usuario_id;

    IF NOT v_empresa_ativa THEN
        RAISE EXCEPTION 'Empresa do usuário não está ativa';
    END IF;

    -- Verificar refeições no período (últimas 2 horas)
    SELECT COUNT(*), MAX(usado_em)
    INTO v_refeicoes_periodo, v_ultima_refeicao
    FROM uso_voucher
    WHERE usuario_id = p_usuario_id
    AND usado_em >= NOW() - INTERVAL '2 hours';

    IF v_refeicoes_periodo >= 1 THEN
        RAISE EXCEPTION 'Limite de refeições por período atingido para voucher extra (máximo 1)';
    END IF;

    -- Verificar refeições no dia
    SELECT COUNT(*)
    INTO v_refeicoes_dia
    FROM uso_voucher
    WHERE usuario_id = p_usuario_id
    AND DATE(usado_em) = CURRENT_DATE;

    IF v_refeicoes_dia >= 1 THEN
        RAISE EXCEPTION 'Limite diário de voucher extra atingido (máximo 1)';
    END IF;

    -- Verificar intervalo mínimo (1 hora)
    IF v_ultima_refeicao IS NOT NULL AND 
       v_ultima_refeicao + INTERVAL '1 hour' > CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'Intervalo mínimo entre refeições não respeitado (1 hora)';
    END IF;

    RETURN TRUE;
END;
$$;

-- Grant necessary permissions
REVOKE ALL ON FUNCTION validate_and_use_voucher(VARCHAR, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION validate_and_use_voucher(VARCHAR, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_and_use_voucher(VARCHAR, UUID) TO anon;

REVOKE ALL ON FUNCTION validate_voucher_usage_limits(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION validate_voucher_usage_limits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_voucher_usage_limits(UUID) TO anon;

REVOKE ALL ON FUNCTION check_voucher_comum_rules(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION check_voucher_comum_rules(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_voucher_comum_rules(UUID, UUID) TO anon;

REVOKE ALL ON FUNCTION check_voucher_extra_rules(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION check_voucher_extra_rules(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_voucher_extra_rules(UUID, UUID) TO anon;

-- Add helpful comments
COMMENT ON FUNCTION validate_and_use_voucher IS 'Validates and registers the use of vouchers with standardized 1 hour minimum interval';
COMMENT ON FUNCTION validate_voucher_usage_limits IS 'Validates voucher usage limits with standardized 1 hour minimum interval';
COMMENT ON FUNCTION check_voucher_comum_rules IS 'Validates common voucher rules with standardized 1 hour minimum interval';
COMMENT ON FUNCTION check_voucher_extra_rules IS 'Validates extra voucher rules with standardized 1 hour minimum interval';