CREATE OR REPLACE FUNCTION validate_and_use_common_voucher(
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

-- Grant necessary permissions
REVOKE ALL ON FUNCTION validate_and_use_common_voucher FROM PUBLIC;
GRANT EXECUTE ON FUNCTION validate_and_use_common_voucher TO authenticated;
GRANT EXECUTE ON FUNCTION validate_and_use_common_voucher TO anon;

-- Add helpful comment
COMMENT ON FUNCTION validate_and_use_common_voucher IS 
'Validates and registers the use of common vouchers with all business rules';