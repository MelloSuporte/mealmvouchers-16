-- Drop existing policies
DROP POLICY IF EXISTS "vouchers_comuns_select_policy" ON vouchers_comuns;
DROP POLICY IF EXISTS "vouchers_comuns_insert_policy" ON vouchers_comuns;
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;

-- Enable RLS
ALTER TABLE vouchers_comuns ENABLE ROW LEVEL SECURITY;
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Create validation function for common vouchers
CREATE OR REPLACE FUNCTION validate_voucher_comum(
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
BEGIN
    -- Find user by voucher code and validate status
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

    -- Validate shift and meal time
    IF NOT EXISTS (
        SELECT 1 
        FROM turnos t
        JOIN tipos_refeicao tr ON true
        WHERE t.id = v_turno_id
        AND tr.id = p_tipo_refeicao_id
        AND t.ativo = true
        AND tr.ativo = true
        AND CURRENT_TIME BETWEEN t.horario_inicio AND t.horario_fim
        AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Horário não permitido para esta refeição/turno'
        );
    END IF;

    -- Check daily usage limit
    IF EXISTS (
        SELECT 1 FROM uso_voucher
        WHERE usuario_id = v_usuario_id
        AND DATE(usado_em) = CURRENT_DATE
        GROUP BY usuario_id
        HAVING COUNT(*) >= 2
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Limite diário de refeições atingido'
        );
    END IF;

    -- Register usage
    INSERT INTO uso_voucher (
        usuario_id,
        tipo_refeicao_id,
        usado_em,
        tipo_voucher
    ) VALUES (
        v_usuario_id,
        p_tipo_refeicao_id,
        CURRENT_TIMESTAMP,
        'comum'
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

-- Create policy for validating and using common vouchers
CREATE POLICY "voucher_comum_validate_policy" ON vouchers_comuns
    FOR SELECT TO authenticated, anon
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.voucher = codigo
            AND NOT u.suspenso
            AND EXISTS (
                SELECT 1 FROM empresas e
                WHERE e.id = u.empresa_id
                AND e.ativo = true
            )
        )
    );

-- Create policy for registering voucher usage
CREATE POLICY "uso_voucher_comum_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated, anon
    WITH CHECK (
        tipo_voucher = 'comum'
        AND EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = usuario_id
            AND NOT u.suspenso
            AND EXISTS (
                SELECT 1 FROM empresas e
                WHERE e.id = u.empresa_id
                AND e.ativo = true
            )
            AND EXISTS (
                SELECT 1 FROM turnos t
                JOIN tipos_refeicao tr ON true
                WHERE t.id = u.turno_id
                AND tr.id = tipo_refeicao_id
                AND t.ativo = true
                AND tr.ativo = true
                AND CURRENT_TIME BETWEEN t.horario_inicio AND t.horario_fim
                AND CURRENT_TIME BETWEEN tr.horario_inicio 
                    AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
            )
        )
    );

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION validate_voucher_comum TO authenticated;
GRANT EXECUTE ON FUNCTION validate_voucher_comum TO anon;

-- Add helpful comments
COMMENT ON FUNCTION validate_voucher_comum IS 'Validates and registers the use of common vouchers with all business rules';
COMMENT ON POLICY "voucher_comum_validate_policy" ON vouchers_comuns IS 'Allows validation of common vouchers for active users';
COMMENT ON POLICY "uso_voucher_comum_insert_policy" ON uso_voucher IS 'Controls registration of common voucher usage with time and shift validation';