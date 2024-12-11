-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS check_voucher_comum_rules CASCADE;
DROP FUNCTION IF EXISTS validate_voucher_comum CASCADE;

-- Create validation function for common vouchers
CREATE OR REPLACE FUNCTION validate_voucher_comum(
    p_voucher VARCHAR(4)
) RETURNS TABLE (
    usuario_id UUID,
    nome VARCHAR,
    empresa_id UUID,
    turno_id UUID
) LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.nome,
        u.empresa_id,
        u.turno_id
    FROM usuarios u
    WHERE u.voucher = p_voucher
    AND NOT u.suspenso
    AND EXISTS (
        SELECT 1 FROM empresas e 
        WHERE e.id = u.empresa_id 
        AND e.ativo = true
    );

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Voucher inválido ou usuário suspenso';
    END IF;
END;
$$;

-- Create function to check voucher usage rules
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
    v_turno_valido BOOLEAN;
BEGIN
    -- Verificar turno do usuário
    SELECT EXISTS (
        SELECT 1 FROM usuarios u
        JOIN turnos t ON u.turno_id = t.id
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

-- Update uso_voucher policies
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;

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

-- Add comments
COMMENT ON FUNCTION validate_voucher_comum IS 'Valida se um voucher comum é válido e retorna os dados do usuário';
COMMENT ON FUNCTION check_voucher_comum_rules IS 'Verifica as regras de uso para vouchers comuns';