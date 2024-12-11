-- First disable existing policies if any
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON usuarios;
DROP POLICY IF EXISTS "Apenas admins e managers podem gerenciar usuários" ON usuarios;

-- Enable RLS on usuarios table if not already enabled
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Create policy for SELECT operations
CREATE POLICY "usuarios_select_policy" ON usuarios
FOR SELECT USING (true);

-- Create policy for INSERT operations
CREATE POLICY "usuarios_insert_policy" ON usuarios
FOR INSERT WITH CHECK (true);

-- Create policy for UPDATE operations
CREATE POLICY "usuarios_update_policy" ON usuarios
FOR UPDATE USING (true);

-- Grant necessary permissions
GRANT ALL ON usuarios TO authenticated;
GRANT ALL ON usuarios TO anon;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;