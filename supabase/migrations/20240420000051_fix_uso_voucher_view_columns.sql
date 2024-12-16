-- Drop existing view
DROP VIEW IF EXISTS vw_uso_voucher_detalhado;

-- Recreate view with correct column names
CREATE OR REPLACE VIEW vw_uso_voucher_detalhado AS
SELECT 
    uv.id,
    uv.usado_em as data_uso,
    u.id as usuario_id,
    u.nome as nome_usuario,
    u.cpf,
    u.empresa_id,
    e.nome as nome_empresa,
    t.tipo_turno as turno,
    tr.nome as tipo_refeicao,
    tr.valor,
    uv.observacao
FROM uso_voucher uv
LEFT JOIN usuarios u ON uv.usuario_id = u.id
LEFT JOIN empresas e ON u.empresa_id = e.id
LEFT JOIN turnos t ON u.turno_id = t.id
LEFT JOIN tipos_refeicao tr ON uv.tipo_refeicao_id = tr.id;

-- Grant permissions
GRANT SELECT ON vw_uso_voucher_detalhado TO authenticated;