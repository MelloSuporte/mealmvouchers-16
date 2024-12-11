-- Create functions for voucher validations
CREATE OR REPLACE FUNCTION check_voucher_comum_rules(
    p_usuario_id UUID,
    p_tipo_refeicao_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_refeicoes_hoje INT;
    v_ultima_refeicao TIMESTAMP;
    v_turno_usuario VARCHAR;
    v_empresa_ativa BOOLEAN;
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
    SELECT turno INTO v_turno_usuario
    FROM usuarios
    WHERE id = p_usuario_id;

    -- Verificar refeições no dia
    SELECT COUNT(*), MAX(usado_em)
    INTO v_refeicoes_hoje, v_ultima_refeicao
    FROM uso_voucher
    WHERE usuario_id = p_usuario_id
    AND DATE(usado_em) = CURRENT_DATE;

    -- Verificar limite diário (3 refeições)
    IF v_refeicoes_hoje >= 3 THEN
        RAISE EXCEPTION 'Limite diário de refeições atingido';
    END IF;

    -- Verificar intervalo mínimo (3 horas)
    IF v_ultima_refeicao IS NOT NULL AND 
       v_ultima_refeicao + INTERVAL '3 hours' > CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'Intervalo mínimo entre refeições não respeitado';
    END IF;

    -- Verificar limite por período (2 refeições)
    SELECT COUNT(*)
    INTO v_refeicoes_hoje
    FROM uso_voucher
    WHERE usuario_id = p_usuario_id
    AND DATE(usado_em) = CURRENT_DATE
    AND EXTRACT(HOUR FROM usado_em) BETWEEN 
        EXTRACT(HOUR FROM CURRENT_TIMESTAMP) - 4 
        AND EXTRACT(HOUR FROM CURRENT_TIMESTAMP);

    IF v_refeicoes_hoje >= 2 THEN
        RAISE EXCEPTION 'Limite de refeições por período atingido';
    END IF;

    RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION check_voucher_extra_rules(
    p_voucher_id UUID,
    p_usuario_id UUID,
    p_tipo_refeicao_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_refeicoes_hoje INT;
    v_ultima_refeicao TIMESTAMP;
    v_valido_ate DATE;
    v_autorizado BOOLEAN;
    v_empresa_ativa BOOLEAN;
BEGIN
    -- Verificar voucher extra
    SELECT 
        ve.valido_ate,
        ve.autorizado_por IS NOT NULL
    INTO 
        v_valido_ate,
        v_autorizado
    FROM vouchers_extras ve
    WHERE ve.id = p_voucher_id
    AND ve.usuario_id = p_usuario_id;

    IF NOT FOUND OR NOT v_autorizado THEN
        RAISE EXCEPTION 'Voucher extra inválido ou não autorizado';
    END IF;

    IF CURRENT_DATE > v_valido_ate THEN
        RAISE EXCEPTION 'Voucher extra expirado';
    END IF;

    -- Verificar empresa ativa
    SELECT e.ativo INTO v_empresa_ativa
    FROM usuarios u
    JOIN empresas e ON u.empresa_id = e.id
    WHERE u.id = p_usuario_id;

    IF NOT v_empresa_ativa THEN
        RAISE EXCEPTION 'Empresa do usuário não está ativa';
    END IF;

    -- Verificar refeições no dia
    SELECT COUNT(*), MAX(usado_em)
    INTO v_refeicoes_hoje, v_ultima_refeicao
    FROM uso_voucher
    WHERE usuario_id = p_usuario_id
    AND voucher_extra_id IS NOT NULL
    AND DATE(usado_em) = CURRENT_DATE;

    -- Verificar limite diário (1 refeição)
    IF v_refeicoes_hoje >= 1 THEN
        RAISE EXCEPTION 'Limite diário de voucher extra atingido';
    END IF;

    -- Verificar intervalo mínimo (3 horas)
    IF v_ultima_refeicao IS NOT NULL AND 
       v_ultima_refeicao + INTERVAL '3 hours' > CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'Intervalo mínimo entre refeições não respeitado';
    END IF;

    RETURN TRUE;
END;
$$;