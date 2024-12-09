-- Drop existing view if it exists
DROP VIEW IF EXISTS vouchers_extras_view;

-- Create a new view with SECURITY INVOKER explicitly
CREATE VIEW vouchers_extras_view
WITH (security_barrier = true, security_invoker = true)
AS
SELECT 
    ve.id,
    ve.usuario_id,
    ve.tipo_refeicao_id,
    ve.autorizado_por,
    ve.codigo,
    ve.valido_ate,
    ve.usado,
    ve.usado_em,
    ve.observacao,
    ve.criado_em,
    u.nome as usuario_nome,
    tr.nome as tipo_refeicao_nome
FROM vouchers_extras ve
LEFT JOIN usuarios u ON ve.usuario_id = u.id
LEFT JOIN tipos_refeicao tr ON ve.tipo_refeicao_id = tr.id;

-- Set permissions
ALTER VIEW vouchers_extras_view OWNER TO postgres;
GRANT SELECT ON vouchers_extras_view TO authenticated;
GRANT SELECT ON vouchers_extras_view TO anon;

-- Create function to handle inserts with proper security context
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
        p_observacao,
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

-- Revogar e conceder permissões específicas
REVOKE ALL ON FUNCTION insert_voucher_extra FROM PUBLIC;
GRANT EXECUTE ON FUNCTION insert_voucher_extra TO authenticated;

-- Criar função para atualizar voucher
CREATE OR REPLACE FUNCTION update_voucher_extra_status(
    p_voucher_id INTEGER,
    p_usado BOOLEAN,
    p_usado_em TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS vouchers_extras
SECURITY INVOKER
LANGUAGE plpgsql
AS $$
DECLARE
    v_result vouchers_extras;
BEGIN
    UPDATE vouchers_extras
    SET 
        usado = p_usado,
        usado_em = CASE 
            WHEN p_usado THEN COALESCE(p_usado_em, CURRENT_TIMESTAMP)
            ELSE NULL
        END
    WHERE id = p_voucher_id
    RETURNING * INTO v_result;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Voucher não encontrado';
    END IF;

    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao atualizar voucher: %', SQLERRM;
END;
$$;

-- Configurar permissões para a função de atualização
REVOKE ALL ON FUNCTION update_voucher_extra_status FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_voucher_extra_status TO authenticated;
