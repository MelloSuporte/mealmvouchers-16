DROP VIEW IF EXISTS vouchers_extras_view;

CREATE OR REPLACE VIEW vouchers_extras_view
WITH (security_barrier = true, security_invoker = true)
AS
SELECT 
    ve.id,
    ve.usuario_id,
    ve.tipo_refeicao_id,
    ve.autorizado_por,
    ve.codigo,
    ve.valido_ate,
    ve.usado_em IS NOT NULL as usado,
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