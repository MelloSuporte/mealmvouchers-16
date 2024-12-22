/* Drop existing policies */
DROP POLICY IF EXISTS "vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_update_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "public_vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "public_vouchers_descartaveis_update_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "admin_vouchers_descartaveis_insert_policy" ON vouchers_descartaveis;

/* Drop trigger and function */
DROP TRIGGER IF EXISTS prevent_voucher_reuse_trigger ON vouchers_descartaveis;
DROP FUNCTION IF EXISTS prevent_voucher_reuse();

/* Disable RLS */
ALTER TABLE vouchers_descartaveis DISABLE ROW LEVEL SECURITY;

/* Reset permissions */
GRANT ALL ON vouchers_descartaveis TO authenticated;
GRANT ALL ON vouchers_descartaveis TO anon;
GRANT ALL ON tipos_refeicao TO authenticated;
GRANT ALL ON tipos_refeicao TO anon;
GRANT ALL ON uso_voucher TO authenticated;
GRANT ALL ON uso_voucher TO anon;

/* Add helpful comment */
COMMENT ON TABLE vouchers_descartaveis IS 
'Tabela de vouchers descartáveis sem RLS - políticas removidas por não funcionarem conforme esperado';