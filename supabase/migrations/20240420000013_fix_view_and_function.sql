-- Drop existing view
DROP VIEW IF EXISTS vw_uso_voucher_detalhado;

-- Recreate view with correct column names
CREATE OR REPLACE VIEW vw_uso_voucher_detalhado
WITH (security_barrier = true, security_invoker = true)
AS
SELECT 
    uv.id as uso_id,
    uv.data_uso,  -- This was previously 'usado_em'
    COALESCE(u.voucher, vd.codigo) as codigo_voucher,
    CASE 
        WHEN u.voucher IS NOT NULL THEN 'comum'
        WHEN vd.id IS NOT NULL THEN 'descartavel'
        ELSE 'extra'
    END as tipo_voucher,
    CASE 
        WHEN u.voucher IS NOT NULL THEN u.nome
        WHEN vd.id IS NOT NULL THEN 'Voucher Descartável'
        ELSE u.nome
    END as nome_usuario,
    CASE 
        WHEN u.voucher IS NOT NULL THEN u.cpf
        WHEN vd.id IS NOT NULL THEN NULL
        ELSE u.cpf
    END as cpf_usuario,
    tr.nome as tipo_refeicao,
    tr.valor as valor_refeicao,
    e.nome as nome_empresa,
    t.tipo_turno as turno
FROM 
    uso_voucher uv
    LEFT JOIN usuarios u ON uv.usuario_id = u.id
    LEFT JOIN vouchers_descartaveis vd ON vd.id = uv.voucher_descartavel_id
    LEFT JOIN tipos_refeicao tr ON uv.tipo_refeicao_id = tr.id
    LEFT JOIN empresas e ON u.empresa_id = e.id
    LEFT JOIN turnos t ON u.turno_id = t.id;

-- Drop existing function
DROP FUNCTION IF EXISTS insert_voucher_descartavel CASCADE;

-- Recreate function with correct field names
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

-- Grant permissions on view
GRANT SELECT ON vw_uso_voucher_detalhado TO authenticated;