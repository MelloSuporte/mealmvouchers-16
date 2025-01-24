-- Add new columns to vouchers_descartaveis table
ALTER TABLE vouchers_descartaveis 
ADD COLUMN IF NOT EXISTS nome_pessoa VARCHAR(255),
ADD COLUMN IF NOT EXISTS nome_empresa VARCHAR(255);

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS insert_voucher_descartavel;

-- Create updated function with new parameters
CREATE OR REPLACE FUNCTION insert_voucher_descartavel(
    p_codigo VARCHAR,
    p_tipo_refeicao_id UUID,
    p_data_requisicao TIMESTAMP WITH TIME ZONE,
    p_nome_pessoa VARCHAR,
    p_nome_empresa VARCHAR
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_id UUID;
BEGIN
    /* Verificar se o tipo de refeição está ativo */
    IF NOT EXISTS (
        SELECT 1 
        FROM tipos_refeicao 
        WHERE id = p_tipo_refeicao_id 
        AND ativo = true
    ) THEN
        RAISE EXCEPTION 'Tipo de refeição inválido ou inativo';
    END IF;

    /* Verificar se o código já existe */
    IF EXISTS (
        SELECT 1 
        FROM vouchers_descartaveis 
        WHERE codigo = p_codigo
    ) THEN
        RAISE EXCEPTION 'Código de voucher já existe';
    END IF;

    /* Inserir o voucher usando os nomes corretos das colunas */
    INSERT INTO vouchers_descartaveis (
        id,
        tipo_refeicao_id,
        codigo,
        data_requisicao,
        usado_em,
        data_criacao,
        nome_pessoa,
        nome_empresa
    )
    VALUES (
        gen_random_uuid(),
        p_tipo_refeicao_id,
        p_codigo,
        p_data_requisicao,
        NULL,
        CURRENT_TIMESTAMP,
        p_nome_pessoa,
        p_nome_empresa
    )
    RETURNING id INTO v_id;

    RETURN v_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao inserir voucher descartável: %', SQLERRM;
END;
$$;

-- Set function permissions
REVOKE ALL ON FUNCTION insert_voucher_descartavel FROM PUBLIC;
GRANT EXECUTE ON FUNCTION insert_voucher_descartavel TO authenticated;

-- Add comment
COMMENT ON FUNCTION insert_voucher_descartavel IS 'Insere um novo voucher descartável com nome da pessoa e empresa';