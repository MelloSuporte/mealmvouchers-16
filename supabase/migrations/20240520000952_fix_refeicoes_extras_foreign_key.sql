-- Drop existing foreign key constraint
ALTER TABLE refeicoes_extras 
DROP CONSTRAINT IF EXISTS refeicoes_extras_refeicoes_fkey;

-- Drop existing foreign key constraint if it exists with a different name
ALTER TABLE refeicoes_extras 
DROP CONSTRAINT IF EXISTS refeicoes_extras_tipo_refeicao_id_fkey;

-- Add the correct foreign key constraint
ALTER TABLE refeicoes_extras 
ADD CONSTRAINT refeicoes_extras_refeicoes_fkey 
FOREIGN KEY (refeicoes) 
REFERENCES tipos_refeicao(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Add comment for documentation
COMMENT ON CONSTRAINT refeicoes_extras_refeicoes_fkey ON refeicoes_extras IS 
'Foreign key constraint ensuring refeicoes references a valid tipos_refeicao';