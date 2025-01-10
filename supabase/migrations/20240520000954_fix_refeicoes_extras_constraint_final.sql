-- Primeiro, desabilitar temporariamente as verificações de chave estrangeira
SET session_replication_role = 'replica';

-- Remover TODAS as constraints existentes relacionadas a tipos_refeicao
ALTER TABLE refeicoes_extras 
DROP CONSTRAINT IF EXISTS refeicoes_extras_tipo_refeicao_id_fkey;

ALTER TABLE refeicoes_extras 
DROP CONSTRAINT IF EXISTS refeicoes_extras_refeicoes_fkey;

-- Remover qualquer índice existente que possa estar causando conflito
DROP INDEX IF EXISTS idx_refeicoes_extras_tipo_refeicao;
DROP INDEX IF EXISTS idx_refeicoes_extras_refeicoes;

-- Criar a nova constraint correta
ALTER TABLE refeicoes_extras 
ADD CONSTRAINT refeicoes_extras_refeicoes_fkey 
FOREIGN KEY (refeicoes) 
REFERENCES refeicoes(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Criar novo índice para melhorar performance
CREATE INDEX idx_refeicoes_extras_refeicoes 
ON refeicoes_extras(refeicoes);

-- Reabilitar verificações de chave estrangeira
SET session_replication_role = 'origin';

-- Adicionar comentários úteis
COMMENT ON CONSTRAINT refeicoes_extras_refeicoes_fkey ON refeicoes_extras IS 
'Constraint que garante que refeicoes_extras.refeicoes referencia um ID válido na tabela refeicoes';