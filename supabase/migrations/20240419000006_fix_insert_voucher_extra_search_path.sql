-- Drop existing function
DROP FUNCTION IF EXISTS insert_voucher_extra;

-- Recreate function with explicit search_path
CREATE OR REPLACE FUNCTION insert_voucher_extra(
    p_usuario_id UUID,
    p_tipo_refeicao_id UUID,
    p_autorizado_por VARCHAR,
    p_codigo VARCHAR,
    p_valido_ate DATE,
    p_observacao TEXT DEFAULT NULL
)
RETURNS vouchers_extras
SECURITY INVOKER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_result vouchers_extras;
BEGIN
    -- Verificar se o usuário tem permissão
    IF NOT EXISTS (
        SELECT 1 
        FROM usuarios 
        WHERE id = p_usuario_id 
        AND EXISTS (
            SELECT 1 
            FROM tipos_refeicao 
            WHERE id = p_tipo_refeicao_id 
            AND ativo = true
        )
    ) THEN
        RAISE EXCEPTION 'Usuário ou tipo de refeição inválido';
    END IF;

    -- Verificar se já existe um voucher extra para o mesmo usuário e data
    IF EXISTS (
        SELECT 1 
        FROM vouchers_extras 
        WHERE usuario_id = p_usuario_id 
        AND valido_ate = p_valido_ate
        AND NOT usado
    ) THEN
        RAISE EXCEPTION 'Já existe um voucher extra ativo para este usuário nesta data';
    END IF;

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

-- Add comment
COMMENT ON FUNCTION insert_voucher_extra IS 'Insere um novo voucher extra com validações de segurança e regras de negócio';
