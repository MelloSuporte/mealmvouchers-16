-- Drop existing function if it exists
DROP FUNCTION IF EXISTS validate_voucher_extra_usage;

-- Recreate function with correct parameter types
CREATE OR REPLACE FUNCTION validate_voucher_extra_usage(
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

    -- Verificar intervalo mínimo
    IF v_ultima_refeicao IS NOT NULL AND 
       v_ultima_refeicao + INTERVAL '3 hours' > CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'Intervalo mínimo entre refeições não respeitado (3 horas)';
    END IF;

    -- Verificar horário do tipo de refeição
    SELECT EXISTS (
        SELECT 1 FROM vouchers_extras ve
        JOIN tipos_refeicao tr ON ve.tipo_refeicao_id = tr.id
        WHERE ve.id = p_voucher_id
        AND tr.ativo = true
        AND CURRENT_TIME BETWEEN tr.horario_inicio 
        AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
    ) INTO v_dentro_horario;

    IF NOT v_dentro_horario THEN
        RAISE EXCEPTION 'Fora do horário permitido para este tipo de refeição';
    END IF;

    -- Verificar turno do usuário
    SELECT EXISTS (
        SELECT 1 FROM usuarios u
        JOIN turnos t ON u.turno_id = t.id
        WHERE u.id = p_usuario_id
        AND t.ativo = true
        AND CURRENT_TIME BETWEEN t.horario_inicio AND t.horario_fim
    ) INTO v_turno_valido;

    IF NOT v_turno_valido THEN
        RAISE EXCEPTION 'Fora do horário do turno do usuário';
    END IF;

    RETURN TRUE;
END;
$$;

-- Grant necessary permissions
REVOKE ALL ON FUNCTION validate_voucher_extra_usage(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION validate_voucher_extra_usage(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_voucher_extra_usage(UUID, UUID) TO anon;

-- Add helpful comment
COMMENT ON FUNCTION validate_voucher_extra_usage(UUID, UUID) IS 
'Função que implementa todas as validações de uso de voucher extra com tipos UUID corrigidos';