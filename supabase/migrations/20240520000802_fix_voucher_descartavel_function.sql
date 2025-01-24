-- Drop existing function if it exists
DROP FUNCTION IF EXISTS insert_voucher_descartavel;

-- Create updated function with correct parameter names
CREATE OR REPLACE FUNCTION insert_voucher_descartavel(
    codigo VARCHAR,
    tipo_refeicao_id UUID,
    nome_pessoa VARCHAR,
    nome_empresa VARCHAR,
    solicitante UUID
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
        WHERE id = tipo_refeicao_id 
        AND ativo = true
    ) THEN
        RAISE EXCEPTION 'Tipo de refeição inválido ou inativo';
    END IF;

    /* Verificar se o código já existe */
    IF EXISTS (
        SELECT 1 
        FROM vouchers_descartaveis 
        WHERE codigo = codigo
    ) THEN
        RAISE EXCEPTION 'Código de voucher já existe';
    END IF;

    /* Inserir o voucher usando os nomes corretos das colunas */
    INSERT INTO vouchers_descartaveis (
        id,
        codigo,
        tipo_refeicao_id,
        data_criacao,
        data_requisicao,
        data_uso,
        nome_pessoa,
        nome_empresa,
        solicitante
    )
    VALUES (
        gen_random_uuid(),
        codigo,
        tipo_refeicao_id,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        NULL,
        nome_pessoa,
        nome_empresa,
        solicitante
    )
    RETURNING id INTO v_id;

    RETURN v_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao inserir voucher descartável: %', SQLERRM;
END;
$$;