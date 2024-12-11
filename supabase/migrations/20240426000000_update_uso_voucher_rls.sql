-- Drop existing policies
DROP POLICY IF EXISTS "uso_voucher_comum_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_comum_select_policy" ON uso_voucher;

-- Create validation functions
CREATE OR REPLACE FUNCTION check_voucher_comum_rules(
    p_usuario_id UUID,
    p_tipo_refeicao_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    AND voucher_extra_id IS NULL
    AND usado_em >= NOW() - INTERVAL '4 hours';

    IF v_refeicoes_periodo >= 2 THEN
        RAISE EXCEPTION 'Limite de refeições por período atingido (máximo 2)';
    END IF;

    -- Verificar refeições no dia
    SELECT COUNT(*), MAX(usado_em)
    INTO v_refeicoes_dia, v_ultima_refeicao
    FROM uso_voucher
    WHERE usuario_id = p_usuario_id
    AND voucher_extra_id IS NULL
    AND DATE(usado_em) = CURRENT_DATE;

    IF v_refeicoes_dia >= 3 THEN
        RAISE EXCEPTION 'Limite diário de refeições atingido (máximo 3)';
    END IF;

    -- Verificar intervalo mínimo
    IF v_ultima_refeicao IS NOT NULL AND 
       v_ultima_refeicao + INTERVAL '3 hours' > CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'Intervalo mínimo entre refeições não respeitado (3 horas)';
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
    AND voucher_extra_id IS NOT NULL
    AND usado_em >= NOW() - INTERVAL '4 hours';

    IF v_refeicoes_periodo >= 1 THEN
        RAISE EXCEPTION 'Limite de refeições por período atingido para voucher extra (máximo 1)';
    END IF;

    -- Verificar refeições no dia
    SELECT COUNT(*), MAX(usado_em)
    INTO v_refeicoes_dia, v_ultima_refeicao
    FROM uso_voucher
    WHERE usuario_id = p_usuario_id
    AND voucher_extra_id IS NOT NULL
    AND DATE(usado_em) = CURRENT_DATE;

    IF v_refeicoes_dia >= 1 THEN
        RAISE EXCEPTION 'Limite diário de voucher extra atingido (máximo 1)';
    END IF;

    -- Verificar intervalo mínimo
    IF v_ultima_refeicao IS NOT NULL AND 
       v_ultima_refeicao + INTERVAL '3 hours' > CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'Intervalo mínimo entre refeições não respeitado (3 horas)';
    END IF;

    RETURN TRUE;
END;
$$;

-- Create new unified policies
CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'sistema' = 'true'
        )
        AND
        CASE 
            WHEN NEW.voucher_extra_id IS NOT NULL THEN
                check_voucher_extra_rules(NEW.voucher_extra_id, NEW.usuario_id, NEW.tipo_refeicao_id)
            ELSE
                check_voucher_comum_rules(NEW.usuario_id, NEW.tipo_refeicao_id)
        END
    );

CREATE POLICY "uso_voucher_select_policy" ON uso_voucher
    FOR SELECT TO authenticated
    USING (
        usuario_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_usuarios' = 'true'
            AND NOT au.suspenso
        )
    );

-- Add necessary columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'uso_voucher' 
                  AND column_name = 'voucher_extra_id') THEN
        ALTER TABLE uso_voucher 
        ADD COLUMN voucher_extra_id UUID REFERENCES vouchers_extras(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'uso_voucher' 
                  AND column_name = 'observacao') THEN
        ALTER TABLE uso_voucher 
        ADD COLUMN observacao TEXT;
    END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_uso_voucher_extra_id ON uso_voucher(voucher_extra_id);
CREATE INDEX IF NOT EXISTS idx_uso_voucher_data ON uso_voucher(usado_em);

-- Add comments
COMMENT ON POLICY "uso_voucher_insert_policy" ON uso_voucher IS 'Controla inserção de registros de uso de vouchers (comum e extra) com validações específicas';
COMMENT ON POLICY "uso_voucher_select_policy" ON uso_voucher IS 'Controla visualização do histórico de uso de vouchers';