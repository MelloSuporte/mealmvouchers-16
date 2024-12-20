-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    empresa_id UUID REFERENCES empresas(id),
    senha TEXT NOT NULL,
    permissoes JSONB DEFAULT '{
        "gerenciar_vouchers_extra": false,
        "gerenciar_vouchers_descartaveis": false,
        "gerenciar_usuarios": false,
        "gerenciar_relatorios": false
    }'::jsonb,
    suspenso BOOLEAN DEFAULT false,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON admin_users
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated admin users" ON admin_users
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_usuarios' = 'true'
            AND NOT au.suspenso
        )
    );

CREATE POLICY "Enable update for authenticated admin users" ON admin_users
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_usuarios' = 'true'
            AND NOT au.suspenso
        )
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_cpf ON admin_users(cpf);
CREATE INDEX IF NOT EXISTS idx_admin_users_empresa_id ON admin_users(empresa_id);

-- Create trigger for updating atualizado_em
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_admin_users_timestamp
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_users_updated_at();

-- Insert initial admin user for testing (optional)
INSERT INTO admin_users (email, nome, cpf, senha, permissoes)
VALUES (
    'admin@example.com',
    'Administrador',
    '00000000000',
    '0001000',
    '{
        "gerenciar_vouchers_extra": true,
        "gerenciar_vouchers_descartaveis": true,
        "gerenciar_usuarios": true,
        "gerenciar_relatorios": true
    }'::jsonb
) ON CONFLICT DO NOTHING;