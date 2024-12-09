-- Drop existing policies
DROP POLICY IF EXISTS "enable_read_for_all_users" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "enable_insert_for_authenticated_users" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "enable_update_for_authenticated_users" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "Vouchers descartáveis são visíveis para todos" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "Apenas usuários autenticados podem criar vouchers descartáveis" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "Apenas usuários autenticados podem atualizar vouchers descartáveis" ON vouchers_descartaveis;

-- Disable RLS temporarily
ALTER TABLE vouchers_descartaveis DISABLE ROW LEVEL SECURITY;

-- Enable RLS again
ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;

-- Create new unified policies
CREATE POLICY "vouchers_descartaveis_select_policy"
ON vouchers_descartaveis FOR SELECT
USING (true);

CREATE POLICY "vouchers_descartaveis_insert_policy"
ON vouchers_descartaveis FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "vouchers_descartaveis_update_policy"
ON vouchers_descartaveis FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Ensure proper permissions
GRANT ALL ON vouchers_descartaveis TO authenticated;
GRANT ALL ON vouchers_descartaveis TO service_role;

-- Create helper function for inserting disposable vouchers
CREATE OR REPLACE FUNCTION insert_voucher_descartavel(
    p_tipo_refeicao_id UUID,
    p_data_expiracao DATE,
    p_codigo VARCHAR
)
RETURNS UUID
SECURITY INVOKER
SET search_path = public
LANGUAGE plpgsql
AS $$
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

    -- Verificar se a data de expiração é válida
    IF p_data_expiracao < CURRENT_DATE THEN
        RAISE EXCEPTION 'Data de expiração deve ser futura';
    END IF;

    -- Inserir o voucher
    INSERT INTO vouchers_descartaveis (
        id,
        tipo_refeicao_id,
        codigo,
        data_expiracao,
        usado,
        data_criacao
    )
    VALUES (
        gen_random_uuid(),
        p_tipo_refeicao_id,
        p_codigo,
        p_data_expiracao,
        false,
        CURRENT_TIMESTAMP
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
COMMENT ON FUNCTION insert_voucher_descartavel IS 'Insere um novo voucher descartável com validações de segurança';
