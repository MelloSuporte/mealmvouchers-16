-- Adiciona campos faltantes na tabela admin_users
ALTER TABLE admin_users
ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresas(id),
ADD COLUMN IF NOT EXISTS cpf VARCHAR(14) UNIQUE,
ADD COLUMN IF NOT EXISTS senha TEXT;

-- Atualiza as políticas RLS existentes
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON admin_users;
DROP POLICY IF EXISTS "Enable insert for authenticated admin users" ON admin_users;
DROP POLICY IF EXISTS "Enable update for authenticated admin users" ON admin_users;

-- Recria as políticas com nomes mais descritivos
CREATE POLICY "admin_users_select_policy" ON admin_users
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "admin_users_insert_policy" ON admin_users
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_usuarios' = 'true'
            AND NOT au.suspenso
        )
    );

CREATE POLICY "admin_users_update_policy" ON admin_users
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_usuarios' = 'true'
            AND NOT au.suspenso
        )
    );

-- Adiciona índices faltantes
CREATE INDEX IF NOT EXISTS idx_admin_users_cpf ON admin_users(cpf);
CREATE INDEX IF NOT EXISTS idx_admin_users_empresa_id ON admin_users(empresa_id);

-- Insere admin inicial se não existir
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
) ON CONFLICT (email) DO NOTHING;