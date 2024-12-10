-- Recria a view com os campos corretos
CREATE OR REPLACE VIEW vw_uso_voucher_detalhado AS
SELECT 
    uv.id as uso_id,
    uv.usado_em as data_uso,
    COALESCE(u.voucher, ve.codigo) as codigo_voucher,
    CASE 
        WHEN u.voucher IS NOT NULL THEN 'comum'
        WHEN ve.id IS NOT NULL THEN 'extra'
        ELSE 'descartavel'
    END as tipo_voucher,
    CASE 
        WHEN u.voucher IS NOT NULL THEN u.nome
        WHEN ve.id IS NOT NULL THEN ue.nome
        ELSE 'Voucher Descartável'
    END as nome_usuario,
    CASE 
        WHEN u.voucher IS NOT NULL THEN u.cpf
        WHEN ve.id IS NOT NULL THEN ue.cpf
        ELSE NULL
    END as cpf_usuario,
    tr.nome as tipo_refeicao,
    tr.valor as valor_refeicao,
    e.nome as empresa,
    t.tipo_turno as turno
FROM 
    uso_voucher uv
    LEFT JOIN usuarios u ON uv.usuario_id = u.id
    LEFT JOIN vouchers_extras ve ON ve.usuario_id = uv.usuario_id 
        AND ve.tipo_refeicao_id = uv.tipo_refeicao_id 
        AND ve.usado_em = uv.usado_em
    LEFT JOIN usuarios ue ON ve.usuario_id = ue.id
    LEFT JOIN tipos_refeicao tr ON uv.tipo_refeicao_id = tr.id
    LEFT JOIN empresas e ON COALESCE(u.empresa_id, ue.empresa_id) = e.id
    LEFT JOIN turnos t ON COALESCE(u.turno_id, ue.turno_id) = t.id;

-- Remove função existente
DROP FUNCTION IF EXISTS insert_voucher_descartavel CASCADE;

-- Recria função com campos corretos
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

-- Define permissões da função
REVOKE ALL ON FUNCTION insert_voucher_descartavel FROM PUBLIC;
GRANT EXECUTE ON FUNCTION insert_voucher_descartavel TO authenticated;

-- Adiciona comentário
COMMENT ON FUNCTION insert_voucher_descartavel IS 'Insere um novo voucher descartável com validações de segurança';