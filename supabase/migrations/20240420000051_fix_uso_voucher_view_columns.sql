-- Drop existing view
DROP VIEW IF EXISTS vw_uso_voucher_detalhado;

-- Create the updated view with proper joins and column names
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
    u.setor_id,  -- Changed to reference setor_id directly from usuarios table
    s.nome_setor,
    tr.nome as tipo_refeicao,
    tr.valor as valor_refeicao,
    uv.observacao
FROM uso_voucher uv
LEFT JOIN usuarios u ON uv.usuario_id = u.id
LEFT JOIN empresas e ON u.empresa_id = e.id
LEFT JOIN turnos t ON u.turno_id = t.id
LEFT JOIN setores s ON u.setor_id = s.id
LEFT JOIN tipos_refeicao tr ON uv.tipo_refeicao_id = tr.id;

-- Grant permissions
GRANT SELECT ON vw_uso_voucher_detalhado TO authenticated;

-- Add comment to the view
COMMENT ON VIEW vw_uso_voucher_detalhado IS 'View detalhada do uso de vouchers incluindo informações de setor';