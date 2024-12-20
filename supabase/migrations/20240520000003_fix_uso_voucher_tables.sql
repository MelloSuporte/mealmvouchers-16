-- Drop existing views that depend on uso_voucher
DROP VIEW IF EXISTS vw_uso_voucher_detalhado;

-- Backup existing data if needed
CREATE TABLE IF NOT EXISTS uso_voucher_backup AS SELECT * FROM uso_voucher;

-- Drop and recreate uso_voucher table with correct structure
DROP TABLE IF EXISTS uso_voucher CASCADE;

CREATE TABLE uso_voucher (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id),
    tipo_refeicao_id UUID REFERENCES tipos_refeicao(id),
    usado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    voucher_extra_id INTEGER,
    observacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cpf_id UUID,
    cpf TEXT
);

-- Drop and recreate relatorio_uso_voucher table with correct structure
DROP TABLE IF EXISTS relatorio_uso_voucher CASCADE;

CREATE TABLE relatorio_uso_voucher (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_uso TIMESTAMP WITH TIME ZONE NOT NULL,
    usuario_id UUID,
    nome_usuario VARCHAR(255),
    cpf VARCHAR(14),
    empresa_id UUID,
    nome_empresa VARCHAR(255),
    turno VARCHAR(50),
    setor_id INTEGER,
    nome_setor VARCHAR(255),
    tipo_refeicao VARCHAR(255),
    valor NUMERIC,
    observacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recreate the view with correct columns
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
    uv.observacao
FROM uso_voucher uv
LEFT JOIN usuarios u ON uv.usuario_id = u.id
LEFT JOIN empresas e ON u.empresa_id = e.id
LEFT JOIN turnos t ON u.turno_id = t.id
LEFT JOIN setores s ON u.setor_id = s.id
LEFT JOIN tipos_refeicao tr ON uv.tipo_refeicao_id = tr.id;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_uso_voucher_usuario ON uso_voucher(usuario_id);
CREATE INDEX IF NOT EXISTS idx_uso_voucher_tipo_refeicao ON uso_voucher(tipo_refeicao_id);
CREATE INDEX IF NOT EXISTS idx_uso_voucher_data ON uso_voucher(usado_em);
CREATE INDEX IF NOT EXISTS idx_relatorio_uso_data ON relatorio_uso_voucher(data_uso);
CREATE INDEX IF NOT EXISTS idx_relatorio_uso_empresa ON relatorio_uso_voucher(empresa_id);
CREATE INDEX IF NOT EXISTS idx_relatorio_uso_usuario ON relatorio_uso_voucher(usuario_id);

-- Set RLS policies
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorio_uso_voucher ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT ON uso_voucher TO authenticated;
GRANT SELECT ON relatorio_uso_voucher TO authenticated;
GRANT SELECT ON vw_uso_voucher_detalhado TO authenticated;

-- Add comments
COMMENT ON TABLE uso_voucher IS 'Registros de uso de vouchers';
COMMENT ON TABLE relatorio_uso_voucher IS 'Relatório desnormalizado de uso de vouchers';
COMMENT ON VIEW vw_uso_voucher_detalhado IS 'Visão detalhada do uso de vouchers';