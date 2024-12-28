-- Drop existing view if it exists
DROP VIEW IF EXISTS vw_uso_voucher_detalhado;

-- Create view with all necessary columns and joins
CREATE OR REPLACE VIEW vw_uso_voucher_detalhado AS
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
    tr.valor as valor_refeicao,
    uv.observacao,
    uv.created_at
FROM uso_voucher uv
LEFT JOIN usuarios u ON uv.usuario_id = u.id
LEFT JOIN empresas e ON u.empresa_id = e.id
LEFT JOIN turnos t ON u.turno_id = t.id
LEFT JOIN setores s ON u.setor_id = s.id
LEFT JOIN tipos_refeicao tr ON uv.tipo_refeicao_id = tr.id;

-- Set permissions
ALTER VIEW vw_uso_voucher_detalhado OWNER TO postgres;
GRANT SELECT ON vw_uso_voucher_detalhado TO authenticated;

-- Add comment
COMMENT ON VIEW vw_uso_voucher_detalhado IS 'View detalhada do uso de vouchers com todas as informações relacionadas';

-- Create indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_uso_voucher_data_uso ON uso_voucher(usado_em);
CREATE INDEX IF NOT EXISTS idx_uso_voucher_empresa ON usuarios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_uso_voucher_turno ON usuarios(turno_id);
CREATE INDEX IF NOT EXISTS idx_uso_voucher_setor ON usuarios(setor_id);