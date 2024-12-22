-- Desabilitar RLS na tabela turnos
ALTER TABLE turnos DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Permitir leitura de turnos para todos usuários autenticados" ON turnos;
DROP POLICY IF EXISTS "Permitir inserção de turnos apenas para administradores" ON turnos;
DROP POLICY IF EXISTS "Permitir atualização de turnos apenas para administradores" ON turnos;
DROP POLICY IF EXISTS "Permitir deleção de turnos apenas para administradores" ON turnos;

-- Manter permissões básicas
GRANT ALL ON turnos TO authenticated;
GRANT SELECT ON turnos TO anon;
GRANT ALL ON turnos TO service_role;

-- Adicionar comentário na tabela documentando a remoção da RLS
COMMENT ON TABLE turnos IS 'RLS removida em 20/05/2024 devido a problemas de funcionamento. Controle de acesso movido para nível de aplicação.';