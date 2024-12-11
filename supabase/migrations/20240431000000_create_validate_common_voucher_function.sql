-- Create or replace the function for validating and using common vouchers
CREATE OR REPLACE FUNCTION validate_and_use_common_voucher(
    p_usuario_id UUID,
    p_tipo_refeicao_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result JSONB;
    v_uso_id UUID;
BEGIN
    -- Validate user and voucher
    IF NOT EXISTS (
        SELECT 1 FROM usuarios u
        WHERE u.id = p_usuario_id
        AND NOT u.suspenso
    ) THEN
        RAISE EXCEPTION 'Usuário não encontrado ou suspenso';
    END IF;

    -- Check meal type
    IF NOT EXISTS (
        SELECT 1 FROM tipos_refeicao tr
        WHERE tr.id = p_tipo_refeicao_id
        AND tr.ativo = true
    ) THEN
        RAISE EXCEPTION 'Tipo de refeição inválido ou inativo';
    END IF;

    -- Check daily usage limit
    IF EXISTS (
        SELECT 1 FROM uso_voucher uv
        WHERE uv.usuario_id = p_usuario_id
        AND uv.tipo_refeicao_id = p_tipo_refeicao_id
        AND DATE(uv.usado_em) = CURRENT_DATE
        GROUP BY uv.usuario_id
        HAVING COUNT(*) >= 2
    ) THEN
        RAISE EXCEPTION 'Limite diário de uso atingido';
    END IF;

    -- Insert usage record
    INSERT INTO uso_voucher (
        usuario_id,
        tipo_refeicao_id,
        usado_em
    ) VALUES (
        p_usuario_id,
        p_tipo_refeicao_id,
        CURRENT_TIMESTAMP
    )
    RETURNING id INTO v_uso_id;

    -- Prepare success response
    v_result = jsonb_build_object(
        'success', true,
        'uso_id', v_uso_id
    );

    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION validate_and_use_common_voucher TO authenticated;

-- Add comment
COMMENT ON FUNCTION validate_and_use_common_voucher IS 'Validates and registers the use of a common voucher with all business rules';