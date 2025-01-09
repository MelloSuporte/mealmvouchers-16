-- Drop existing policies
DROP POLICY IF EXISTS "refeicoes_extras_insert_policy" ON refeicoes_extras;
DROP POLICY IF EXISTS "refeicoes_extras_select_policy" ON refeicoes_extras;
DROP POLICY IF EXISTS "refeicoes_extras_update_policy" ON refeicoes_extras;
DROP POLICY IF EXISTS "refeicoes_extras_delete_policy" ON refeicoes_extras;

-- Enable RLS
ALTER TABLE refeicoes_extras ENABLE ROW LEVEL SECURITY;

-- Create simplified insert policy
CREATE POLICY "refeicoes_extras_insert_policy" ON refeicoes_extras
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Create simplified select policy
CREATE POLICY "refeicoes_extras_select_policy" ON refeicoes_extras
    FOR SELECT TO authenticated, anon
    USING (true);

-- Create simplified update policy
CREATE POLICY "refeicoes_extras_update_policy" ON refeicoes_extras
    FOR UPDATE TO authenticated
    USING (true);

-- Create simplified delete policy
CREATE POLICY "refeicoes_extras_delete_policy" ON refeicoes_extras
    FOR DELETE TO authenticated
    USING (true);

-- Grant necessary permissions
GRANT ALL ON refeicoes_extras TO authenticated;
GRANT SELECT ON refeicoes_extras TO anon;

-- Add helpful comments
COMMENT ON TABLE refeicoes_extras IS 'Tabela de refeições extras com políticas simplificadas';