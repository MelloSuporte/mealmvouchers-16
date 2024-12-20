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

-- Enable RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorio_uso_voucher ENABLE ROW LEVEL SECURITY;

-- Políticas para uso_voucher
CREATE POLICY "uso_voucher_select_policy" ON uso_voucher
    FOR SELECT TO authenticated
    USING (
        -- Usuários podem ver seus próprios registros
        usuario_id = auth.uid()
        OR 
        -- Admins podem ver todos os registros
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated
    WITH CHECK (
        -- Apenas admins podem inserir
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

CREATE POLICY "uso_voucher_update_policy" ON uso_voucher
    FOR UPDATE TO authenticated
    USING (
        -- Apenas admins podem atualizar
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

CREATE POLICY "uso_voucher_delete_policy" ON uso_voucher
    FOR DELETE TO authenticated
    USING (
        -- Apenas admins podem deletar
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

-- Políticas para relatorio_uso_voucher
CREATE POLICY "relatorio_uso_voucher_select_policy" ON relatorio_uso_voucher
    FOR SELECT TO authenticated
    USING (
        -- Usuários podem ver seus próprios relatórios
        usuario_id = auth.uid()
        OR 
        -- Admins podem ver todos os relatórios
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

CREATE POLICY "relatorio_uso_voucher_insert_policy" ON relatorio_uso_voucher
    FOR INSERT TO authenticated
    WITH CHECK (
        -- Apenas admins podem inserir
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

CREATE POLICY "relatorio_uso_voucher_update_policy" ON relatorio_uso_voucher
    FOR UPDATE TO authenticated
    USING (
        -- Apenas admins podem atualizar
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

CREATE POLICY "relatorio_uso_voucher_delete_policy" ON relatorio_uso_voucher
    FOR DELETE TO authenticated
    USING (
        -- Apenas admins podem deletar
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

-- Grant permissions
GRANT SELECT ON uso_voucher TO authenticated;
GRANT SELECT ON relatorio_uso_voucher TO authenticated;
GRANT SELECT ON vw_uso_voucher_detalhado TO authenticated;

-- Add comments
COMMENT ON TABLE uso_voucher IS 'Registros de uso de vouchers';
COMMENT ON TABLE relatorio_uso_voucher IS 'Relatório desnormalizado de uso de vouchers';
COMMENT ON VIEW vw_uso_voucher_detalhado IS 'Visão detalhada do uso de vouchers';
COMMENT ON POLICY "uso_voucher_select_policy" ON uso_voucher IS 'Controla quem pode visualizar registros de uso de voucher';
COMMENT ON POLICY "uso_voucher_insert_policy" ON uso_voucher IS 'Controla quem pode inserir registros de uso de voucher';
COMMENT ON POLICY "uso_voucher_update_policy" ON uso_voucher IS 'Controla quem pode atualizar registros de uso de voucher';
COMMENT ON POLICY "uso_voucher_delete_policy" ON uso_voucher IS 'Controla quem pode deletar registros de uso de voucher';
COMMENT ON POLICY "relatorio_uso_voucher_select_policy" ON relatorio_uso_voucher IS 'Controla quem pode visualizar relatórios de uso de voucher';
COMMENT ON POLICY "relatorio_uso_voucher_insert_policy" ON relatorio_uso_voucher IS 'Controla quem pode inserir relatórios de uso de voucher';
COMMENT ON POLICY "relatorio_uso_voucher_update_policy" ON relatorio_uso_voucher IS 'Controla quem pode atualizar relatórios de uso de voucher';
COMMENT ON POLICY "relatorio_uso_voucher_delete_policy" ON relatorio_uso_voucher IS 'Controla quem pode deletar relatórios de uso de voucher';