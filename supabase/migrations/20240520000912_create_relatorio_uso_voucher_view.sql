-- Drop view if it exists
DROP VIEW IF EXISTS relatorio_uso_voucher;

-- Create the view
CREATE OR REPLACE VIEW relatorio_uso_voucher AS
SELECT 
    uv.id,
    uv.usado_em as data_uso,
    u.id as usuario_id,
    u.nome as nome_usuario,
    u.cpf,
    e.id as empresa_id,
    e.nome as nome_empresa,
    t.tipo_turno as turno,
    s.id as setor_id,
    s.nome_setor,
    tr.nome as tipo_refeicao,
    tr.valor,
    uv.observacao,
    uv.created_at,
    uv.updated_at
FROM uso_voucher uv
LEFT JOIN usuarios u ON uv.usuario_id = u.id
LEFT JOIN empresas e ON u.empresa_id = e.id
LEFT JOIN turnos t ON u.turno_id = t.id
LEFT JOIN setores s ON u.setor_id = s.id
LEFT JOIN tipos_refeicao tr ON uv.tipo_refeicao_id = tr.id;

-- Add RLS policies
ALTER VIEW relatorio_uso_voucher SECURITY INVOKER;

COMMENT ON VIEW relatorio_uso_voucher IS 'View consolidada para relatórios de uso de vouchers';