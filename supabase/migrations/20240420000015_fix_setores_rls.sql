-- Remover políticas existentes
DROP POLICY IF EXISTS "Setores são visíveis para todos os usuários autenticados" ON setores;
DROP POLICY IF EXISTS "Enable read access for all users" ON setores;

-- Criar nova política que permite acesso de leitura para todos
CREATE POLICY "Enable read access for all users"
ON setores
FOR SELECT
USING (true);

-- Garantir que RLS está ativado
ALTER TABLE setores ENABLE ROW LEVEL SECURITY;