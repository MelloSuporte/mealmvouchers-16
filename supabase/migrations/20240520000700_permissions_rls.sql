-- Enable RLS on admin_users table if not already enabled
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create or replace function to check admin permissions
CREATE OR REPLACE FUNCTION check_admin_permission(permission text)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE id = auth.uid()
    AND permissoes->permission = 'true'
    AND NOT suspenso
  );
END;
$$;

-- Create policies for each permission type
CREATE POLICY "usuarios_access_policy" ON usuarios
    FOR ALL TO authenticated
    USING (check_admin_permission('gerenciar_usuarios'));

CREATE POLICY "empresas_access_policy" ON empresas
    FOR ALL TO authenticated
    USING (check_admin_permission('gerenciar_empresas'));

CREATE POLICY "tipos_refeicao_access_policy" ON tipos_refeicao
    FOR ALL TO authenticated
    USING (check_admin_permission('gerenciar_tipos_refeicao'));

CREATE POLICY "turnos_access_policy" ON turnos
    FOR ALL TO authenticated
    USING (check_admin_permission('gerenciar_turnos'));

CREATE POLICY "imagens_fundo_access_policy" ON imagens_fundo
    FOR ALL TO authenticated
    USING (check_admin_permission('gerenciar_imagens_fundo'));

CREATE POLICY "admin_users_access_policy" ON admin_users
    FOR ALL TO authenticated
    USING (check_admin_permission('gerenciar_gerentes'));

-- Add comments for documentation
COMMENT ON FUNCTION check_admin_permission IS 'Verifica se o usuário tem a permissão específica';