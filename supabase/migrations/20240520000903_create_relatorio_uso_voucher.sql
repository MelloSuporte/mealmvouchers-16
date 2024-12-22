-- Drop table if exists (to ensure clean state)
DROP TABLE IF EXISTS relatorio_uso_voucher CASCADE;

-- Create relatorio_uso_voucher table
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
    valor DECIMAL(10,2),
    observacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_relatorio_uso_data ON relatorio_uso_voucher(data_uso);
CREATE INDEX IF NOT EXISTS idx_relatorio_uso_empresa ON relatorio_uso_voucher(empresa_id);
CREATE INDEX IF NOT EXISTS idx_relatorio_uso_usuario ON relatorio_uso_voucher(usuario_id);

-- Enable RLS
ALTER TABLE relatorio_uso_voucher ENABLE ROW LEVEL SECURITY;

-- Create policies with full access for authenticated users
CREATE POLICY "relatorio_uso_voucher_select_policy" ON relatorio_uso_voucher
    FOR SELECT TO authenticated, anon
    USING (true);

CREATE POLICY "relatorio_uso_voucher_insert_policy" ON relatorio_uso_voucher
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "relatorio_uso_voucher_update_policy" ON relatorio_uso_voucher
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "relatorio_uso_voucher_delete_policy" ON relatorio_uso_voucher
    FOR DELETE TO authenticated
    USING (true);

-- Grant permissions
GRANT ALL ON relatorio_uso_voucher TO authenticated;
GRANT SELECT ON relatorio_uso_voucher TO anon;
GRANT ALL ON relatorio_uso_voucher TO service_role;

-- Add comments
COMMENT ON TABLE relatorio_uso_voucher IS 'Tabela de relatório de uso de vouchers com dados denormalizados para consulta rápida';
COMMENT ON POLICY "relatorio_uso_voucher_select_policy" ON relatorio_uso_voucher IS 'Permite que todos os usuários visualizem relatórios';
COMMENT ON POLICY "relatorio_uso_voucher_insert_policy" ON relatorio_uso_voucher IS 'Permite que usuários autenticados insiram relatórios';
COMMENT ON POLICY "relatorio_uso_voucher_update_policy" ON relatorio_uso_voucher IS 'Permite que usuários autenticados atualizem relatórios';
COMMENT ON POLICY "relatorio_uso_voucher_delete_policy" ON relatorio_uso_voucher IS 'Permite que usuários autenticados deletem relatórios';

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_relatorio_uso_voucher_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for timestamp updates
CREATE TRIGGER update_relatorio_uso_voucher_timestamp
    BEFORE UPDATE ON relatorio_uso_voucher
    FOR EACH ROW
    EXECUTE FUNCTION update_relatorio_uso_voucher_timestamp();