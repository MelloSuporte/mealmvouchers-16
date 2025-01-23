-- Desabilitar RLS em todas as tabelas
ALTER TABLE vouchers_descartaveis DISABLE ROW LEVEL SECURITY;
ALTER TABLE uso_voucher DISABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers_extras DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE turnos DISABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_refeicao DISABLE ROW LEVEL SECURITY;
ALTER TABLE setores DISABLE ROW LEVEL SECURITY;
ALTER TABLE refeicoes_extras DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_update_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;
DROP POLICY IF EXISTS "vouchers_extras_select_policy" ON vouchers_extras;
DROP POLICY IF EXISTS "vouchers_extras_update_policy" ON vouchers_extras;
DROP POLICY IF EXISTS "usuarios_select_policy" ON usuarios;
DROP POLICY IF EXISTS "usuarios_update_policy" ON usuarios;
DROP POLICY IF EXISTS "empresas_select_policy" ON empresas;
DROP POLICY IF EXISTS "empresas_update_policy" ON empresas;
DROP POLICY IF EXISTS "turnos_select_policy" ON turnos;
DROP POLICY IF EXISTS "turnos_update_policy" ON turnos;
DROP POLICY IF EXISTS "tipos_refeicao_select_policy" ON tipos_refeicao;
DROP POLICY IF EXISTS "tipos_refeicao_update_policy" ON tipos_refeicao;
DROP POLICY IF EXISTS "setores_select_policy" ON setores;
DROP POLICY IF EXISTS "setores_update_policy" ON setores;
DROP POLICY IF EXISTS "refeicoes_extras_select_policy" ON refeicoes_extras;
DROP POLICY IF EXISTS "refeicoes_extras_update_policy" ON refeicoes_extras;
DROP POLICY IF EXISTS "admin_users_select_policy" ON admin_users;
DROP POLICY IF EXISTS "admin_users_update_policy" ON admin_users;

-- Garantir permissões necessárias
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Adicionar comentário explicativo
COMMENT ON SCHEMA public IS 'Validações de segurança centralizadas no sistema em vez de RLS';