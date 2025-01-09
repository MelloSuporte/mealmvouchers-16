-- Drop existing policies
DROP POLICY IF EXISTS "refeicoes_extras_insert_policy" ON refeicoes_extras;
DROP POLICY IF EXISTS "refeicoes_extras_select_policy" ON refeicoes_extras;
DROP POLICY IF EXISTS "refeicoes_extras_update_policy" ON refeicoes_extras;

-- Enable RLS
ALTER TABLE refeicoes_extras ENABLE ROW LEVEL SECURITY;

-- Create simplified insert policy that allows authenticated users to insert
CREATE POLICY "refeicoes_extras_insert_policy" ON refeicoes_extras
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Create simplified select policy that allows all users to view
CREATE POLICY "refeicoes_extras_select_policy" ON refeicoes_extras
    FOR SELECT TO authenticated, anon
    USING (true);

-- Create simplified update policy that allows authenticated users to update
CREATE POLICY "refeicoes_extras_update_policy" ON refeicoes_extras
    FOR UPDATE TO authenticated
    USING (true);

-- Create simplified delete policy that allows authenticated users to delete
CREATE POLICY "refeicoes_extras_delete_policy" ON refeicoes_extras
    FOR DELETE TO authenticated
    USING (true);

-- Grant necessary permissions
GRANT ALL ON refeicoes_extras TO authenticated;
GRANT SELECT ON refeicoes_extras TO anon;

-- Add helpful comments
COMMENT ON POLICY "refeicoes_extras_insert_policy" ON refeicoes_extras IS 
'Permite inserção de refeições extras para usuários autenticados';

COMMENT ON POLICY "refeicoes_extras_select_policy" ON refeicoes_extras IS 
'Permite visualização de refeições extras para todos os usuários';

COMMENT ON POLICY "refeicoes_extras_update_policy" ON refeicoes_extras IS 
'Permite atualização de refeições extras para usuários autenticados';

COMMENT ON POLICY "refeicoes_extras_delete_policy" ON refeicoes_extras IS 
'Permite exclusão de refeições extras para usuários autenticados';