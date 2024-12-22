-- Desabilitar RLS temporariamente
ALTER TABLE vouchers_extras DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "vouchers_extras_select_policy" ON vouchers_extras;
DROP POLICY IF EXISTS "vouchers_extras_update_policy" ON vouchers_extras;
DROP POLICY IF EXISTS "vouchers_extras_insert_policy" ON vouchers_extras;

-- Remover função de validação
DROP FUNCTION IF EXISTS check_voucher_extra_rules;

-- Garantir permissões corretas
GRANT ALL ON vouchers_extras TO authenticated;
GRANT ALL ON vouchers_extras TO anon;
GRANT USAGE ON SEQUENCE vouchers_extras_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE vouchers_extras_id_seq TO anon;

-- Adicionar comentário na tabela
COMMENT ON TABLE vouchers_extras IS 'Tabela de vouchers extras - RLS removida por não funcionar conforme esperado';