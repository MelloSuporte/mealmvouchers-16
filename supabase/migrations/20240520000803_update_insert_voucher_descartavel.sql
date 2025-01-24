-- Drop existing function if it exists
DROP FUNCTION IF EXISTS insert_voucher_descartavel;

-- Create updated function without data_expiracao
CREATE OR REPLACE FUNCTION public.insert_voucher_descartavel(
    p_codigo TEXT,
    p_tipo_refeicao_id UUID,
    p_nome_pessoa TEXT,
    p_nome_empresa TEXT
)
RETURNS UUID AS
$$
DECLARE
    v_id UUID;
BEGIN
    -- Verificar se o tipo de refeição está ativo
    IF NOT EXISTS (
        SELECT 1 
        FROM tipos_refeicao 
        WHERE id = p_tipo_refeicao_id 
        AND ativo = true
    ) THEN
        RAISE EXCEPTION 'Tipo de refeição inválido ou inativo';
    END IF;

    -- Verificar se o código já existe
    IF EXISTS (
        SELECT 1 
        FROM vouchers_descartaveis 
        WHERE codigo = p_codigo
    ) THEN
        RAISE EXCEPTION 'Código de voucher já existe';
    END IF;

    -- Inserir o voucher
    INSERT INTO vouchers_descartaveis (
        id,
        tipo_refeicao_id,
        codigo,
        usado_em,
        data_criacao,
        nome_pessoa,
        nome_empresa
    )
    VALUES (
        gen_random_uuid(),
        p_tipo_refeicao_id,
        p_codigo,
        NULL,
        CURRENT_TIMESTAMP,
        p_nome_pessoa,
        p_nome_empresa
    )
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Set function permissions
REVOKE ALL ON FUNCTION insert_voucher_descartavel FROM PUBLIC;
GRANT EXECUTE ON FUNCTION insert_voucher_descartavel TO authenticated;

-- Add comment
COMMENT ON FUNCTION insert_voucher_descartavel IS 'Insere um novo voucher descartável com nome da pessoa e empresa';