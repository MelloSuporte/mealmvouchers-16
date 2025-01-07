-- Criar tabela para refeições extras
CREATE TABLE IF NOT EXISTS refeicoes_extras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id),
    tipo_refeicao_id UUID REFERENCES tipos_refeicao(id),
    valor DECIMAL(10,2) NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    data_consumo DATE NOT NULL,
    observacao TEXT,
    autorizado_por UUID REFERENCES auth.users(id),
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
CREATE INDEX idx_refeicoes_extras_usuario ON refeicoes_extras(usuario_id);
CREATE INDEX idx_refeicoes_extras_tipo_refeicao ON refeicoes_extras(tipo_refeicao_id);
CREATE INDEX idx_refeicoes_extras_data ON refeicoes_extras(data_consumo);