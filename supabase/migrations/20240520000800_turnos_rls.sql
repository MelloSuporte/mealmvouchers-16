-- Enable RLS on turnos table
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Turnos - Select for authenticated users" ON turnos;
DROP POLICY IF EXISTS "Turnos - Insert for administrators" ON turnos;
DROP POLICY IF EXISTS "Turnos - Update for administrators" ON turnos;
DROP POLICY IF EXISTS "Turnos - Delete for administrators" ON turnos;

-- Create SELECT policy - Any authenticated user can view shifts
CREATE POLICY "Turnos - Select for authenticated users"
ON turnos FOR SELECT
TO authenticated, anon
USING (true);

-- Create INSERT policy - Only administrators can insert new shifts
CREATE POLICY "Turnos - Insert for administrators"
ON turnos FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.permissoes->>'admin' = 'true'
        AND NOT au.suspenso
    )
);

-- Create UPDATE policy - Only administrators can update shifts
CREATE POLICY "Turnos - Update for administrators"
ON turnos FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.permissoes->>'admin' = 'true'
        AND NOT au.suspenso
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.permissoes->>'admin' = 'true'
        AND NOT au.suspenso
    )
);

-- Create DELETE policy - Only administrators can delete shifts
CREATE POLICY "Turnos - Delete for administrators"
ON turnos FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.permissoes->>'admin' = 'true'
        AND NOT au.suspenso
    )
);

-- Grant necessary permissions
GRANT ALL ON turnos TO authenticated;
GRANT SELECT ON turnos TO anon;
GRANT ALL ON turnos TO service_role;

-- Add comment documenting the policies
COMMENT ON TABLE turnos IS 'Tabela de turnos com RLS implementada. Políticas: SELECT para usuários autenticados, INSERT/UPDATE/DELETE apenas para administradores.';