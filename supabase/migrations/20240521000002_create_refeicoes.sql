-- Create refeicoes table
CREATE TABLE IF NOT EXISTS refeicoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE refeicoes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Permitir select para todos usuários autenticados" ON refeicoes
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Permitir insert/update para admins" ON refeicoes
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND NOT au.suspenso
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND NOT au.suspenso
        )
    );