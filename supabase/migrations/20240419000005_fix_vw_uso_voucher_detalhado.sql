-- Drop existing view
DROP VIEW IF EXISTS vw_uso_voucher_detalhado;

-- Recreate view with SECURITY INVOKER
CREATE VIEW vw_uso_voucher_detalhado
WITH (security_barrier = true, security_invoker = true)
AS
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
    e.nome as nome_empresa
FROM 
    uso_voucher uv
    LEFT JOIN usuarios u ON uv.usuario_id = u.id
    LEFT JOIN vouchers_extras ve ON ve.usuario_id = uv.usuario_id 
        AND ve.tipo_refeicao_id = uv.tipo_refeicao_id 
        AND ve.usado_em = uv.usado_em
    LEFT JOIN usuarios ue ON ve.usuario_id = ue.id
    LEFT JOIN tipos_refeicao tr ON uv.tipo_refeicao_id = tr.id
    LEFT JOIN empresas e ON COALESCE(u.empresa_id, ue.empresa_id) = e.id;

-- Set permissions
ALTER VIEW vw_uso_voucher_detalhado OWNER TO postgres;

-- Grant permissions
GRANT SELECT ON vw_uso_voucher_detalhado TO authenticated;

-- Create helper function for inserting usage records
CREATE OR REPLACE FUNCTION insert_uso_voucher(
    p_usuario_id UUID,
    p_tipo_refeicao_id UUID
)
RETURNS TABLE (
    uso_id INTEGER,
    nome_usuario VARCHAR,
    tipo_refeicao VARCHAR,
    valor_refeicao DECIMAL
)
SECURITY INVOKER
LANGUAGE plpgsql
AS $$
DECLARE
    v_uso_id INTEGER;
    v_nome VARCHAR;
    v_tipo_refeicao VARCHAR;
    v_valor DECIMAL;
BEGIN
    -- Insert usage record
    INSERT INTO uso_voucher (
        usuario_id,
        tipo_refeicao_id,
        usado_em
    ) 
    VALUES (
        p_usuario_id,
        p_tipo_refeicao_id,
        CURRENT_TIMESTAMP
    )
    RETURNING id INTO v_uso_id;

    -- Get details from view
    SELECT 
        vw.nome_usuario,
        vw.tipo_refeicao,
        vw.valor_refeicao
    INTO
        v_nome,
        v_tipo_refeicao,
        v_valor
    FROM vw_uso_voucher_detalhado vw
    WHERE vw.uso_id = v_uso_id;

    RETURN QUERY
    SELECT 
        v_uso_id,
        v_nome,
        v_tipo_refeicao,
        v_valor;
END;
$$;

-- Set function permissions
REVOKE ALL ON FUNCTION insert_uso_voucher FROM PUBLIC;
GRANT EXECUTE ON FUNCTION insert_uso_voucher TO authenticated;
