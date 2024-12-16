-- Drop the existing view if it exists
DROP VIEW IF EXISTS vw_uso_voucher_detalhado;

-- Create the updated view with proper joins and column names
CREATE OR REPLACE VIEW vw_uso_voucher_detalhado AS
SELECT 
    uv.id,
    uv.usado_em as data_uso,
    u.id as usuario_id,
    u.nome as nome_usuario,
    u.cpf,
    e.id as empresa_id,  -- Keep empresa_id for consistency
    e.nome as nome_empresa,
    t.tipo_turno as turno,
    tr.nome as tipo_refeicao,
    tr.valor,
    uv.observacao
FROM uso_voucher uv
JOIN usuarios u ON uv.usuario_id = u.id
JOIN empresas e ON u.empresa_id = e.id
JOIN turnos t ON u.turno_id = t.id
JOIN tipos_refeicao tr ON uv.tipo_refeicao_id = tr.id;

-- Add comment to the view
COMMENT ON VIEW vw_uso_voucher_detalhado IS 'View detalhada do uso de vouchers com informações relacionadas';