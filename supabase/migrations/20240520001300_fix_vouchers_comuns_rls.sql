-- Drop existing policies
DROP POLICY IF EXISTS "vouchers_comuns_select_policy" ON vouchers_comuns;
DROP POLICY IF EXISTS "vouchers_comuns_insert_policy" ON vouchers_comuns;
DROP POLICY IF EXISTS "vouchers_comuns_update_policy" ON vouchers_comuns;

-- Enable RLS
ALTER TABLE vouchers_comuns ENABLE ROW LEVEL SECURITY;

-- Create select policy with all validations
CREATE POLICY "vouchers_comuns_select_policy" ON vouchers_comuns
    FOR SELECT TO authenticated, anon
    USING (
        -- Voucher não usado
        NOT usado
        AND usado_em IS NULL
        -- Validar turno do usuário
        AND EXISTS (
            SELECT 1 FROM usuarios u
            JOIN turnos t ON u.turno_id = t.id
            WHERE u.voucher = codigo
            AND t.ativo = true
            AND CURRENT_TIME BETWEEN t.horario_inicio AND t.horario_fim
        )
        -- Validar horário da refeição
        AND EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
                AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
        -- Validar limite diário
        AND NOT EXISTS (
            SELECT 1 FROM uso_voucher uv
            JOIN usuarios u ON u.voucher = codigo
            WHERE uv.usuario_id = u.id
            AND DATE(uv.usado_em) = CURRENT_DATE
            GROUP BY uv.usuario_id
            HAVING COUNT(*) >= 3
        )
    );

-- Create update policy with same validations
CREATE POLICY "vouchers_comuns_update_policy" ON vouchers_comuns
    FOR UPDATE TO authenticated, anon
    USING (
        -- Mesmas validações do SELECT
        NOT usado
        AND usado_em IS NULL
        AND EXISTS (
            SELECT 1 FROM usuarios u
            JOIN turnos t ON u.turno_id = t.id
            WHERE u.voucher = codigo
            AND t.ativo = true
            AND CURRENT_TIME BETWEEN t.horario_inicio AND t.horario_fim
        )
        AND EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
                AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
        AND NOT EXISTS (
            SELECT 1 FROM uso_voucher uv
            JOIN usuarios u ON u.voucher = codigo
            WHERE uv.usuario_id = u.id
            AND DATE(uv.usado_em) = CURRENT_DATE
            GROUP BY uv.usuario_id
            HAVING COUNT(*) >= 3
        )
    )
    WITH CHECK (
        usado = true
        AND usado_em IS NOT NULL
    );

-- Create function to validate voucher usage
CREATE OR REPLACE FUNCTION validate_voucher_comum_usage(
    p_codigo VARCHAR(4)
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_usuario_id UUID;
    v_refeicoes_dia INTEGER;
BEGIN
    -- Get user ID
    SELECT id INTO v_usuario_id
    FROM usuarios
    WHERE voucher = p_codigo;

    -- Count daily usage
    SELECT COUNT(*)
    INTO v_refeicoes_dia
    FROM uso_voucher
    WHERE usuario_id = v_usuario_id
    AND DATE(usado_em) = CURRENT_DATE;

    RETURN v_refeicoes_dia < 3;
END;
$$;

-- Create trigger to enforce validation
CREATE OR REPLACE FUNCTION trigger_validate_voucher_comum_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT validate_voucher_comum_usage(NEW.codigo) THEN
        RAISE EXCEPTION 'Limite diário de refeições atingido';
    END IF;
    RETURN NEW;
END;
$$;

-- Add trigger to vouchers_comuns table
DROP TRIGGER IF EXISTS validate_voucher_comum_usage_trigger ON vouchers_comuns;
CREATE TRIGGER validate_voucher_comum_usage_trigger
    BEFORE UPDATE ON vouchers_comuns
    FOR EACH ROW
    EXECUTE FUNCTION trigger_validate_voucher_comum_usage();

-- Grant necessary permissions
GRANT SELECT, UPDATE ON vouchers_comuns TO authenticated;
GRANT SELECT, UPDATE ON vouchers_comuns TO anon;
GRANT SELECT ON usuarios TO anon;
GRANT SELECT ON turnos TO anon;
GRANT SELECT ON tipos_refeicao TO anon;
GRANT SELECT ON uso_voucher TO anon;

-- Add helpful comments
COMMENT ON POLICY "vouchers_comuns_select_policy" ON vouchers_comuns IS 
'Permite visualização de vouchers comuns apenas se não usado, dentro do horário do turno e da refeição, e respeitando limite diário';

COMMENT ON POLICY "vouchers_comuns_update_policy" ON vouchers_comuns IS 
'Permite atualização de vouchers comuns apenas se todas as validações passarem';

COMMENT ON FUNCTION validate_voucher_comum_usage IS 
'Valida o uso de voucher comum verificando limite diário de refeições';