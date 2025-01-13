-- Drop existing policies
DROP POLICY IF EXISTS "vouchers_extras_select_policy" ON vouchers_extras;
DROP POLICY IF EXISTS "vouchers_extras_insert_policy" ON vouchers_extras;
DROP POLICY IF EXISTS "vouchers_extras_update_policy" ON vouchers_extras;

-- Disable RLS
ALTER TABLE vouchers_extras DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON vouchers_extras TO authenticated;
GRANT ALL ON vouchers_extras TO anon;

-- Add helpful comment
COMMENT ON TABLE vouchers_extras IS 'Tabela de vouchers extras sem RLS para permitir registros de vouchers extras';