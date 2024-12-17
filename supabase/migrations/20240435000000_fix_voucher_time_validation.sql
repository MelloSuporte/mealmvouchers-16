-- Drop function if exists
DROP FUNCTION IF EXISTS validate_and_use_voucher(VARCHAR, UUID);

-- Create updated function with time and shift validation
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
    v_hora_atual TIME;
    v_tipo_refeicao RECORD;
    v_turno RECORD;
BEGIN
    -- Get current time
    v_hora_atual := CURRENT_TIME;

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

    -- Get meal type information
    SELECT * INTO v_tipo_refeicao
    FROM tipos_refeicao
    WHERE id = p_tipo_refeicao_id
    AND ativo = true;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Tipo de refeição inválido ou inativo'
        );
    END IF;

    -- Get shift information
    SELECT * INTO v_turno
    FROM turnos
    WHERE id = v_turno_id
    AND ativo = true;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Turno inválido ou inativo'
        );
    END IF;

    -- Validate meal time
    IF v_tipo_refeicao.hora_inicio IS NOT NULL AND v_tipo_refeicao.hora_fim IS NOT NULL THEN
        IF v_hora_atual < v_tipo_refeicao.hora_inicio OR 
           v_hora_atual > v_tipo_refeicao.hora_fim + (v_tipo_refeicao.minutos_tolerancia || ' minutes')::INTERVAL THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', format('Esta refeição só pode ser utilizada entre %s e %s (tolerância de %s minutos)',
                    v_tipo_refeicao.hora_inicio::TEXT,
                    v_tipo_refeicao.hora_fim::TEXT,
                    v_tipo_refeicao.minutos_tolerancia::TEXT
                )
            );
        END IF;
    END IF;

    -- Validate shift time
    IF v_hora_atual < v_turno.horario_inicio OR v_hora_atual > v_turno.horario_fim THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Seu turno permite uso apenas entre %s e %s',
                v_turno.horario_inicio::TEXT,
                v_turno.horario_fim::TEXT
            )
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
        usado_em
    ) VALUES (
        v_usuario_id,
        p_tipo_refeicao_id,
        CURRENT_TIMESTAMP
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Voucher validado com sucesso'
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
REVOKE ALL ON FUNCTION validate_and_use_voucher(VARCHAR, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION validate_and_use_voucher(VARCHAR, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_and_use_voucher(VARCHAR, UUID) TO anon;

-- Add comment
COMMENT ON FUNCTION validate_and_use_voucher(VARCHAR, UUID) IS 'Validates and registers voucher usage with time and shift restrictions';