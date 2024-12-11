CREATE OR REPLACE FUNCTION check_voucher_extra_rules(
    voucher_id UUID,
    usuario_id UUID,
    tipo_refeicao_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_refeicoes_periodo INT;
    v_refeicoes_dia INT;
    v_ultima_refeicao TIMESTAMP;
    v_valido_ate DATE;
    v_autorizado BOOLEAN;
    v_empresa_ativa BOOLEAN;
    v_turno_valido BOOLEAN;
BEGIN
    -- Verificar voucher extra
    SELECT 
        ve.valido_ate,
        ve.autorizado_por IS NOT NULL
    INTO 
        v_valido_ate,
        v_autorizado
    FROM vouchers_extras ve
    WHERE ve.id = voucher_id
    AND ve.usuario_id = usuario_id;

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
    WHERE u.id = usuario_id;

    IF NOT v_empresa_ativa THEN
        RAISE EXCEPTION 'Empresa do usuário não está ativa';
    END IF;

    -- Verificar refeições no período (últimas 4 horas)
    SELECT COUNT(*)
    INTO v_refeicoes_periodo
    FROM uso_voucher
    WHERE usuario_id = usuario_id
    AND voucher_extra_id IS NOT NULL
    AND usado_em >= NOW() - INTERVAL '4 hours';

    IF v_refeicoes_periodo >= 1 THEN
        RAISE EXCEPTION 'Limite de refeições por período atingido para voucher extra (máximo 1)';
    END IF;

    -- Verificar refeições no dia
    SELECT COUNT(*), MAX(usado_em)
    INTO v_refeicoes_dia, v_ultima_refeicao
    FROM uso_voucher
    WHERE usuario_id = usuario_id
    AND voucher_extra_id IS NOT NULL
    AND DATE(usado_em) = CURRENT_DATE;

    IF v_refeicoes_dia >= 1 THEN
        RAISE EXCEPTION 'Limite diário de voucher extra atingido (máximo 1)';
    END IF;

    RETURN TRUE;
END;
$$;