-- Drop existing function if it exists
DROP FUNCTION IF EXISTS validate_and_use_voucher CASCADE;

-- Create updated function with proper data insertion and null handling
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
    v_cpf VARCHAR;
    v_result JSONB;
    v_refeicoes_dia INTEGER;
    v_ultima_refeicao TIMESTAMP;
BEGIN
    -- Find user by voucher code
    SELECT u.id, u.turno_id, u.empresa_id, u.cpf
    INTO v_usuario_id, v_turno_id, v_empresa_id, v_cpf
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

    -- Check meal time and shift
    IF NOT check_meal_time_and_shift(p_tipo_refeicao_id, v_turno_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Horário não permitido para esta refeição'
        );
    END IF;

    -- Check daily limit - handle null case
    SELECT COALESCE(COUNT(*), 0), MAX(usado_em)
    INTO v_refeicoes_dia, v_ultima_refeicao
    FROM uso_voucher
    WHERE usuario_id = v_usuario_id
    AND DATE(usado_em) = CURRENT_DATE;

    -- If no previous usage, v_refeicoes_dia will be 0
    IF v_refeicoes_dia >= 3 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Limite diário de refeições atingido'
        );
    END IF;

    -- Check minimum interval only if there was a previous usage
    IF v_ultima_refeicao IS NOT NULL AND 
       v_ultima_refeicao + INTERVAL '3 hours' > CURRENT_TIMESTAMP THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Intervalo mínimo entre refeições não respeitado'
        );
    END IF;

    -- Register usage with all required fields
    INSERT INTO uso_voucher (
        usuario_id,
        tipo_refeicao_id,
        usado_em,
        cpf,
        observacao
    ) VALUES (
        v_usuario_id,
        p_tipo_refeicao_id,
        CURRENT_TIMESTAMP,
        v_cpf,
        'Voucher comum utilizado'
    );

    -- Log the usage
    INSERT INTO logs_sistema (
        tipo,
        mensagem,
        detalhes,
        nivel
    ) VALUES (
        'USO_VOUCHER',
        'Voucher utilizado com sucesso',
        jsonb_build_object(
            'usuario_id', v_usuario_id,
            'tipo_refeicao_id', p_tipo_refeicao_id,
            'codigo_voucher', p_codigo
        ),
        'info'
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Voucher validado com sucesso',
        'usuario_id', v_usuario_id
    );

EXCEPTION
    WHEN OTHERS THEN
        -- Log error
        INSERT INTO logs_sistema (
            tipo,
            mensagem,
            detalhes,
            nivel
        ) VALUES (
            'ERRO_VOUCHER',
            'Erro ao registrar uso do voucher',
            jsonb_build_object(
                'error', SQLERRM,
                'codigo_voucher', p_codigo
            ),
            'error'
        );
        
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Grant necessary permissions
REVOKE ALL ON FUNCTION validate_and_use_voucher FROM PUBLIC;
GRANT EXECUTE ON FUNCTION validate_and_use_voucher TO authenticated;
GRANT EXECUTE ON FUNCTION validate_and_use_voucher TO anon;

-- Add helpful comment
COMMENT ON FUNCTION validate_and_use_voucher IS 'Validates and registers the use of vouchers with proper data insertion, logging and null handling';