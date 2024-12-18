-- Create validation function
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
    v_voucher_descartavel RECORD;
BEGIN
    -- Set validation flag
    PERFORM set_config('voucher.validated', 'true', true);

    -- Primeiro tenta encontrar um voucher descartável válido
    SELECT *
    INTO v_voucher_descartavel
    FROM vouchers_descartaveis vd
    WHERE vd.codigo = p_codigo
    AND vd.tipo_refeicao_id = p_tipo_refeicao_id
    AND NOT vd.usado
    AND CURRENT_DATE <= vd.data_expiracao::date
    AND EXISTS (
        SELECT 1 FROM tipos_refeicao tr
        WHERE tr.id = vd.tipo_refeicao_id
        AND tr.ativo = true
        AND CURRENT_TIME BETWEEN tr.horario_inicio 
        AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
    );

    -- Se encontrou um voucher descartável válido
    IF FOUND THEN
        -- Marcar voucher como usado
        UPDATE vouchers_descartaveis
        SET 
            usado = true,
            data_uso = CURRENT_TIMESTAMP
        WHERE id = v_voucher_descartavel.id;

        -- Registrar uso
        INSERT INTO uso_voucher (
            tipo_refeicao_id,
            usado_em
        ) VALUES (
            p_tipo_refeicao_id,
            CURRENT_TIMESTAMP
        );

        -- Reset validation flag
        PERFORM set_config('voucher.validated', 'false', true);

        RETURN jsonb_build_object(
            'success', true,
            'message', 'Voucher descartável validado com sucesso'
        );
    END IF;

    -- Se não encontrou voucher descartável, tenta voucher comum
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
        PERFORM set_config('voucher.validated', 'false', true);
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Voucher inválido ou já utilizado'
        );
    END IF;

    -- Verificar horário da refeição
    IF NOT EXISTS (
        SELECT 1 FROM tipos_refeicao tr
        WHERE tr.id = p_tipo_refeicao_id
        AND tr.ativo = true
        AND CURRENT_TIME BETWEEN tr.horario_inicio 
        AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
    ) THEN
        PERFORM set_config('voucher.validated', 'false', true);
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Fora do horário permitido para esta refeição'
        );
    END IF;

    -- Register usage for common voucher
    INSERT INTO uso_voucher (
        usuario_id,
        tipo_refeicao_id,
        usado_em
    ) VALUES (
        v_usuario_id,
        p_tipo_refeicao_id,
        CURRENT_TIMESTAMP
    );

    -- Reset validation flag
    PERFORM set_config('voucher.validated', 'false', true);

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Voucher validado com sucesso'
    );

EXCEPTION
    WHEN OTHERS THEN
        -- Ensure flag is reset on error
        PERFORM set_config('voucher.validated', 'false', true);
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION set_config(text, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION set_config(text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_and_use_voucher TO authenticated;
GRANT EXECUTE ON FUNCTION validate_and_use_voucher TO anon;

-- Add comment
COMMENT ON FUNCTION validate_and_use_voucher IS 
'Valida e registra o uso de um voucher (comum ou descartável) com todas as regras de negócio';