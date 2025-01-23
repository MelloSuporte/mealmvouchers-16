-- Disable RLS on voucher-related tables
ALTER TABLE vouchers_descartaveis DISABLE ROW LEVEL SECURITY;
ALTER TABLE uso_voucher DISABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers_extras DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_update_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;
DROP POLICY IF EXISTS "vouchers_extras_select_policy" ON vouchers_extras;
DROP POLICY IF EXISTS "vouchers_extras_update_policy" ON vouchers_extras;

-- Grant necessary permissions
GRANT ALL ON vouchers_descartaveis TO authenticated;
GRANT ALL ON uso_voucher TO authenticated;
GRANT ALL ON vouchers_extras TO authenticated;
GRANT ALL ON vouchers_descartaveis TO anon;
GRANT ALL ON uso_voucher TO anon;
GRANT SELECT ON tipos_refeicao TO anon;