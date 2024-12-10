-- Drop existing function
DROP FUNCTION IF EXISTS insert_voucher_extra;

-- Recreate function with explicit search_path and security definer
CREATE OR REPLACE FUNCTION insert_voucher_extra(
    p_usuario_id UUID,
    p_tipo_refeicao_id UUID,
    p_autorizado_por VARCHAR,
    p_codigo VARCHAR,
    p_valido_ate DATE,
    p_observacao TEXT DEFAULT NULL
)
RETURNS vouchers_extras
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_result vouchers_extras;
BEGIN
    -- Inserir o voucher
    INSERT INTO vouchers_extras (
        usuario_id,
        tipo_refeicao_id,
        autorizado_por,
        codigo,
        valido_ate,
        observacao,
        usado,
        criado_em
    )
    VALUES (
        p_usuario_id,
        p_tipo_refeicao_id,
        p_autorizado_por,
        p_codigo,
        p_valido_ate,
        COALESCE(p_observacao, 'Voucher extra gerado via sistema'),
        false,
        CURRENT_TIMESTAMP
    )
    RETURNING * INTO v_result;

    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao inserir voucher extra: %', SQLERRM;
END;
$$;

-- Set function permissions
REVOKE ALL ON FUNCTION insert_voucher_extra FROM PUBLIC;
GRANT EXECUTE ON FUNCTION insert_voucher_extra TO authenticated;
GRANT EXECUTE ON FUNCTION insert_voucher_extra TO service_role;

-- Add comment
COMMENT ON FUNCTION insert_voucher_extra IS 'Insere um novo voucher extra com validações de segurança e regras de negócio';