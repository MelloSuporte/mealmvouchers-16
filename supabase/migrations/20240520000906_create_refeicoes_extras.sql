-- Criar tabela para refeições extras
CREATE TABLE IF NOT EXISTS refeicoes_extras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS
ALTER TABLE refeicoes_extras ENABLE ROW LEVEL SECURITY;

-- Criar políticas
CREATE POLICY "Permitir leitura para usuários autenticados" ON refeicoes_extras
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção para usuários autenticados" ON refeicoes_extras
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir atualização para usuários autenticados" ON refeicoes_extras
    FOR UPDATE TO authenticated USING (true);

-- Criar índices
CREATE INDEX idx_refeicoes_extras_nome ON refeicoes_extras(nome);
CREATE INDEX idx_refeicoes_extras_ativo ON refeicoes_extras(ativo);