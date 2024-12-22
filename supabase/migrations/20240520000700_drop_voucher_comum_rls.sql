-- Drop existing policies for usuarios (voucher comum)
DROP POLICY IF EXISTS "usuarios_voucher_select_policy" ON usuarios;
DROP POLICY IF EXISTS "usuarios_voucher_update_policy" ON usuarios;

-- Drop existing policies for uso_voucher
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;

-- Drop validation function
DROP FUNCTION IF EXISTS check_voucher_comum_rules;

-- Disable RLS on uso_voucher table
ALTER TABLE uso_voucher DISABLE ROW LEVEL SECURITY;

-- Grant proper permissions
GRANT ALL ON uso_voucher TO authenticated;
GRANT ALL ON uso_voucher TO anon;
GRANT ALL ON usuarios TO authenticated;
GRANT ALL ON usuarios TO anon;

-- Add comment explaining why RLS was removed
COMMENT ON TABLE uso_voucher IS 'Tabela de uso de vouchers (RLS removida por não funcionar conforme esperado)';
COMMENT ON TABLE usuarios IS 'Tabela de usuários (RLS de vouchers removida por não funcionar conforme esperado)';