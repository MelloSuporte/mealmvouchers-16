-- Drop existing policies
DROP POLICY IF EXISTS "refeicoes_extras_insert_policy" ON refeicoes_extras;
DROP POLICY IF EXISTS "refeicoes_extras_select_policy" ON refeicoes_extras;
DROP POLICY IF EXISTS "refeicoes_extras_update_policy" ON refeicoes_extras;

-- Enable RLS
ALTER TABLE refeicoes_extras ENABLE ROW LEVEL SECURITY;

-- Create insert policy that allows authenticated users to insert
CREATE POLICY "refeicoes_extras_insert_policy" ON refeicoes_extras
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Create select policy
CREATE POLICY "refeicoes_extras_select_policy" ON refeicoes_extras
    FOR SELECT TO authenticated
    USING (true);

-- Create update policy
CREATE POLICY "refeicoes_extras_update_policy" ON refeicoes_extras
    FOR UPDATE TO authenticated
    USING (true);

-- Grant necessary permissions
GRANT ALL ON refeicoes_extras TO authenticated;

-- Add helpful comments
COMMENT ON POLICY "refeicoes_extras_insert_policy" ON refeicoes_extras IS 
'Permite inserção de refeições extras para usuários autenticados';

COMMENT ON POLICY "refeicoes_extras_select_policy" ON refeicoes_extras IS 
'Permite visualização de refeições extras para usuários autenticados';

COMMENT ON POLICY "refeicoes_extras_update_policy" ON refeicoes_extras IS 
'Permite atualização de refeições extras para usuários autenticados';