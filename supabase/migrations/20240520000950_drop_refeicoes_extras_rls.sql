-- Drop existing policies
DROP POLICY IF EXISTS "refeicoes_extras_delete_policy" ON refeicoes_extras;
DROP POLICY IF EXISTS "refeicoes_extras_insert_policy" ON refeicoes_extras;
DROP POLICY IF EXISTS "refeicoes_extras_select_policy" ON refeicoes_extras;
DROP POLICY IF EXISTS "refeicoes_extras_update_policy" ON refeicoes_extras;

-- Disable RLS
ALTER TABLE refeicoes_extras DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON refeicoes_extras TO authenticated;
GRANT ALL ON refeicoes_extras TO anon;

-- Add helpful comment
COMMENT ON TABLE refeicoes_extras IS 'Tabela de refeições extras sem RLS para permitir validações no sistema';