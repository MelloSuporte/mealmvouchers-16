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
BEGIN
    -- Set validation flag
    PERFORM set_config('voucher.validated', 'true', true);

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
        PERFORM set_config('voucher.validated', 'false', true);
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Voucher inválido ou usuário suspenso'
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
'Valida e registra o uso de um voucher com todas as regras de negócio';