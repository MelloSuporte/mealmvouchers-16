-- Add role column to usuarios table
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' 
CHECK (role IN ('user', 'admin', 'gestor', 'system'));

-- Update existing policies to use the new role column
DROP POLICY IF EXISTS "tipos_refeicao_select_policy" ON tipos_refeicao;
DROP POLICY IF EXISTS "tipos_refeicao_insert_policy" ON tipos_refeicao;
DROP POLICY IF EXISTS "tipos_refeicao_update_policy" ON tipos_refeicao;

-- Create new policies using the role column
CREATE POLICY "tipos_refeicao_select_policy" ON tipos_refeicao
    FOR SELECT USING (
        -- Todos podem visualizar tipos de refeição ativos
        ativo = true
        OR 
        -- Admins podem ver todos
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

CREATE POLICY "tipos_refeicao_insert_policy" ON tipos_refeicao
    FOR INSERT WITH CHECK (
        -- Apenas admins podem inserir
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

CREATE POLICY "tipos_refeicao_update_policy" ON tipos_refeicao
    FOR UPDATE USING (
        -- Apenas admins podem atualizar
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

-- Grant necessary permissions
GRANT SELECT ON tipos_refeicao TO authenticated;
GRANT INSERT ON tipos_refeicao TO authenticated;
GRANT UPDATE ON tipos_refeicao TO authenticated;

-- Add comment to document the role column
COMMENT ON COLUMN usuarios.role IS 'User role: user, admin, gestor, or system';