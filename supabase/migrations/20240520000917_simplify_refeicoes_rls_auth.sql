-- Drop existing policies
DROP POLICY IF EXISTS "refeicoes_select_policy" ON refeicoes;
DROP POLICY IF EXISTS "refeicoes_insert_policy" ON refeicoes;
DROP POLICY IF EXISTS "refeicoes_update_policy" ON refeicoes;

-- Enable RLS
ALTER TABLE refeicoes ENABLE ROW LEVEL SECURITY;

-- Create SELECT policy (permite leitura para todos autenticados)
CREATE POLICY "refeicoes_select_policy" ON refeicoes
    FOR SELECT
    USING (auth.role() IS NOT NULL);

-- Create INSERT policy (permite inserção para usuários autenticados)
CREATE POLICY "refeicoes_insert_policy" ON refeicoes
    FOR INSERT
    WITH CHECK (auth.role() IS NOT NULL);

-- Create UPDATE policy (permite atualização para usuários autenticados)
CREATE POLICY "refeicoes_update_policy" ON refeicoes
    FOR UPDATE
    USING (auth.role() IS NOT NULL);

-- Grant necessary permissions
GRANT ALL ON refeicoes TO authenticated;

-- Add helpful comments
COMMENT ON POLICY "refeicoes_select_policy" ON refeicoes IS 'Permite que usuários autenticados visualizem refeições';
COMMENT ON POLICY "refeicoes_insert_policy" ON refeicoes IS 'Permite que usuários autenticados insiram refeições';
COMMENT ON POLICY "refeicoes_update_policy" ON refeicoes IS 'Permite que usuários autenticados atualizem refeições';