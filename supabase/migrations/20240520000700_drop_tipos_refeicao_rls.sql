-- Desabilitar RLS na tabela tipos_refeicao
ALTER TABLE tipos_refeicao DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "tipos_refeicao_select_policy" ON tipos_refeicao;
DROP POLICY IF EXISTS "tipos_refeicao_insert_policy" ON tipos_refeicao;
DROP POLICY IF EXISTS "tipos_refeicao_update_policy" ON tipos_refeicao;
DROP POLICY IF EXISTS "tipos_refeicao_delete_policy" ON tipos_refeicao;

-- Garantir que as permissões básicas ainda estejam presentes
GRANT ALL ON tipos_refeicao TO authenticated;
GRANT SELECT ON tipos_refeicao TO anon;
GRANT ALL ON tipos_refeicao TO service_role;

-- Adicionar comentário na tabela para documentar a remoção da RLS
COMMENT ON TABLE tipos_refeicao IS 'Tabela de tipos de refeição (RLS removida em 20240520 devido a problemas de funcionamento)';