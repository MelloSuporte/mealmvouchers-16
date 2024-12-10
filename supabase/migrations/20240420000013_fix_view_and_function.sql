-- Remove view existente
DROP VIEW IF EXISTS vw_uso_voucher_detalhado;

-- Recria view com nomes de colunas corretos
CREATE OR REPLACE VIEW vw_uso_voucher_detalhado
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
    e.nome as nome_empresa,
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

-- Define permissões da função
REVOKE ALL ON FUNCTION insert_voucher_descartavel FROM PUBLIC;
GRANT EXECUTE ON FUNCTION insert_voucher_descartavel TO authenticated;

-- Adiciona comentário
COMMENT ON FUNCTION insert_voucher_descartavel IS 'Insere um novo voucher descartável com validações de segurança';

-- Concede permissões na view
GRANT SELECT ON vw_uso_voucher_detalhado TO authenticated;