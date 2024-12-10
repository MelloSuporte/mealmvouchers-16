-- Temporarily disable RLS
ALTER TABLE vouchers_descartaveis DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_insert_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_update_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "Vouchers são visíveis para todos" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "Apenas usuários autenticados podem inserir vouchers" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "Apenas usuários autenticados podem atualizar vouchers" ON vouchers_descartaveis;

-- Enable RLS
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

-- Grant proper permissions
GRANT ALL ON vouchers_descartaveis TO authenticated;
GRANT ALL ON vouchers_descartaveis TO service_role;

-- Drop and recreate the function with proper security context
DROP FUNCTION IF EXISTS insert_voucher_descartavel;

CREATE OR REPLACE FUNCTION insert_voucher_descartavel(
    p_tipo_refeicao_id UUID,
    p_data_expiracao DATE,
    p_codigo VARCHAR
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_id UUID;
BEGIN
    -- Verificar se o usuário está autenticado
    IF auth.role() != 'authenticated' THEN
        RAISE EXCEPTION 'Usuário não autenticado';
    END IF;

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

-- Set function owner and permissions
ALTER FUNCTION insert_voucher_descartavel(UUID, DATE, VARCHAR) OWNER TO postgres;
REVOKE ALL ON FUNCTION insert_voucher_descartavel(UUID, DATE, VARCHAR) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION insert_voucher_descartavel(UUID, DATE, VARCHAR) TO authenticated;

-- Add comment
COMMENT ON FUNCTION insert_voucher_descartavel IS 'Insere um novo voucher descartável com validações de segurança';

-- Create helper function for using disposable vouchers with proper security context
DROP FUNCTION IF EXISTS use_voucher_descartavel;

CREATE OR REPLACE FUNCTION use_voucher_descartavel(
    p_codigo VARCHAR
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_id UUID;
BEGIN
    -- Verificar se o usuário está autenticado
    IF auth.role() != 'authenticated' THEN
        RAISE EXCEPTION 'Usuário não autenticado';
    END IF;

    -- Verificar se o voucher existe e não está usado
    SELECT id INTO v_id
    FROM vouchers_descartaveis
    WHERE codigo = p_codigo
    AND NOT usado
    AND data_expiracao >= CURRENT_TIMESTAMP;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Voucher não encontrado, já utilizado ou expirado';
    END IF;

    -- Marcar voucher como usado
    UPDATE vouchers_descartaveis
    SET 
        usado = true,
        data_uso = CURRENT_TIMESTAMP
    WHERE id = v_id;

    RETURN v_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao usar voucher descartável: %', SQLERRM;
END;
$$;

-- Set function owner and permissions
ALTER FUNCTION use_voucher_descartavel(VARCHAR) OWNER TO postgres;
REVOKE ALL ON FUNCTION use_voucher_descartavel(VARCHAR) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION use_voucher_descartavel(VARCHAR) TO authenticated;

-- Add comment
COMMENT ON FUNCTION use_voucher_descartavel IS 'Marca um voucher descartável como usado';