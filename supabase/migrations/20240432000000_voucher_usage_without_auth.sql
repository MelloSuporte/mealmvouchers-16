-- Drop existing policies
DROP POLICY IF EXISTS "vouchers_comuns_select_policy" ON vouchers_comuns;
DROP POLICY IF EXISTS "vouchers_extras_select_policy" ON vouchers_extras;
DROP POLICY IF EXISTS "vouchers_descartaveis_select_policy" ON vouchers_descartaveis;

-- Enable RLS
ALTER TABLE vouchers_comuns ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;

-- Create function to validate meal time and shift
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
        AND v_current_time BETWEEN tr.horario_inicio AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
    ) INTO v_is_valid;
    
    RETURN v_is_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies for vouchers_comuns
CREATE POLICY "allow_voucher_comum_select_by_code" ON vouchers_comuns
    FOR SELECT USING (true);

-- Create policies for vouchers_extras
CREATE POLICY "allow_voucher_extra_select_by_code" ON vouchers_extras
    FOR SELECT USING (true);

-- Create policies for vouchers_descartaveis
CREATE POLICY "allow_voucher_descartavel_select_by_code" ON vouchers_descartaveis
    FOR SELECT USING (true);

-- Create function to validate and use voucher
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
    v_result JSONB;
    v_refeicoes_dia INTEGER;
    v_ultima_refeicao TIMESTAMP;
BEGIN
    -- Tentar encontrar voucher comum
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

    -- Se encontrou voucher comum
    IF FOUND THEN
        -- Verificar horário da refeição e turno
        IF NOT check_meal_time_and_shift(p_tipo_refeicao_id, v_turno_id) THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Horário não permitido para esta refeição'
            );
        END IF;

        -- Verificar limite diário
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

        -- Verificar intervalo mínimo
        IF v_ultima_refeicao IS NOT NULL AND 
           v_ultima_refeicao + INTERVAL '3 hours' > CURRENT_TIMESTAMP THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Intervalo mínimo entre refeições não respeitado'
            );
        END IF;

        -- Registrar uso
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
            'message', 'Voucher comum validado com sucesso'
        );
    END IF;

    -- Se não encontrou voucher comum, tentar voucher descartável
    IF EXISTS (
        SELECT 1 FROM vouchers_descartaveis vd
        WHERE vd.codigo = p_codigo
        AND NOT vd.usado
        AND vd.data_expiracao >= CURRENT_DATE
        AND vd.tipo_refeicao_id = p_tipo_refeicao_id
    ) THEN
        UPDATE vouchers_descartaveis
        SET usado = true,
            data_uso = CURRENT_TIMESTAMP
        WHERE codigo = p_codigo;

        RETURN jsonb_build_object(
            'success', true,
            'message', 'Voucher descartável validado com sucesso'
        );
    END IF;

    -- Por fim, tentar voucher extra
    IF EXISTS (
        SELECT 1 FROM vouchers_extras ve
        WHERE ve.codigo = p_codigo
        AND NOT ve.usado
        AND ve.valido_ate >= CURRENT_DATE
        AND ve.tipo_refeicao_id = p_tipo_refeicao_id
    ) THEN
        UPDATE vouchers_extras
        SET usado = true,
            usado_em = CURRENT_TIMESTAMP
        WHERE codigo = p_codigo;

        RETURN jsonb_build_object(
            'success', true,
            'message', 'Voucher extra validado com sucesso'
        );
    END IF;

    -- Se não encontrou nenhum voucher válido
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Voucher inválido ou já utilizado'
    );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION validate_and_use_voucher TO anon;
GRANT EXECUTE ON FUNCTION check_meal_time_and_shift TO anon;

-- Grant SELECT permissions to anon role
GRANT SELECT ON vouchers_comuns TO anon;
GRANT SELECT ON vouchers_extras TO anon;
GRANT SELECT ON vouchers_descartaveis TO anon;
GRANT SELECT ON tipos_refeicao TO anon;
GRANT SELECT ON turnos TO anon;
GRANT SELECT ON usuarios TO anon;
GRANT SELECT ON empresas TO anon;

-- Add comments
COMMENT ON FUNCTION validate_and_use_voucher IS 'Validates and registers the use of any type of voucher without requiring authentication';
COMMENT ON FUNCTION check_meal_time_and_shift IS 'Validates if the current time is within allowed meal time for the given shift';