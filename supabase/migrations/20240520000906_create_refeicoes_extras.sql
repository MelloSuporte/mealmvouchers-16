-- Create table for extra meals
CREATE TABLE IF NOT EXISTS refeicoes_extras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id),
    tipo_refeicao_id UUID REFERENCES tipos_refeicao(id),
    valor DECIMAL(10,2) NOT NULL,
    quantidade INTEGER NOT NULL,
    data_solicitacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_consumo DATE NOT NULL,
    observacao TEXT,
    autorizado_por UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_refeicoes_extras_usuario ON refeicoes_extras(usuario_id);
CREATE INDEX idx_refeicoes_extras_data ON refeicoes_extras(data_consumo);

-- Enable RLS
ALTER TABLE refeicoes_extras ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "refeicoes_extras_select" ON refeicoes_extras
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND (u.role IN ('admin', 'gestor') OR u.id = usuario_id)
        )
    );

CREATE POLICY "refeicoes_extras_insert" ON refeicoes_extras
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'gestor')
        )
    );