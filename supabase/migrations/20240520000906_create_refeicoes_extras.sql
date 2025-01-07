-- Create table for extra meals
CREATE TABLE IF NOT EXISTS refeicoes_extras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_refeicao VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE refeicoes_extras ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON refeicoes_extras
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON refeicoes_extras
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON refeicoes_extras
    FOR UPDATE TO authenticated USING (true);

-- Create index
CREATE INDEX idx_refeicoes_extras_nome ON refeicoes_extras(nome_refeicao);
CREATE INDEX idx_refeicoes_extras_ativo ON refeicoes_extras(ativo);