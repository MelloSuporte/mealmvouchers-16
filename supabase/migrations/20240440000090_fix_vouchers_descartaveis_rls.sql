-- Drop existing policies
DROP POLICY IF EXISTS "vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_update_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_insert_policy" ON vouchers_descartaveis;

-- Enable RLS
ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;

-- Create select policy with no restrictions
CREATE POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis
    FOR SELECT TO authenticated
    USING (true);

-- Create update policy with no restrictions
CREATE POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create insert policy with no restrictions
CREATE POLICY "vouchers_descartaveis_insert_policy" ON vouchers_descartaveis
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON vouchers_descartaveis TO authenticated;

-- Add helpful comments
COMMENT ON POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis IS 
'Permite que qualquer usuário autenticado visualize vouchers descartáveis';

COMMENT ON POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis IS 
'Permite que qualquer usuário autenticado atualize vouchers descartáveis';

COMMENT ON POLICY "vouchers_descartaveis_insert_policy" ON vouchers_descartaveis IS
'Permite que qualquer usuário autenticado crie vouchers descartáveis';