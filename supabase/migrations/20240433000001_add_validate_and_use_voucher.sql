-- Drop function if it exists
DROP FUNCTION IF EXISTS validate_and_use_voucher;

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

    -- If user found with common voucher
    IF FOUND THEN
        -- Check meal time and shift
        IF NOT check_meal_time_and_shift(p_tipo_refeicao_id, v_turno_id) THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Horário não permitido para esta refeição'
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
            'message', 'Voucher validado com sucesso',
            'usuario_id', v_usuario_id
        );
    END IF;

    -- Try to find and validate extra voucher
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
        WHERE codigo = p_codigo
        RETURNING id INTO v_usuario_id;

        RETURN jsonb_build_object(
            'success', true,
            'message', 'Voucher extra validado com sucesso',
            'usuario_id', v_usuario_id
        );
    END IF;

    -- Try to find and validate disposable voucher
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

    -- If no valid voucher found
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Voucher inválido ou já utilizado'
    );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION validate_and_use_voucher TO anon;
GRANT EXECUTE ON FUNCTION validate_and_use_voucher TO authenticated;

-- Add comment
COMMENT ON FUNCTION validate_and_use_voucher IS 'Validates and registers the use of any type of voucher (common, extra, or disposable)';