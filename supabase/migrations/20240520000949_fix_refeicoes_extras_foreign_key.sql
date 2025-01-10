-- Drop existing foreign key if it exists
ALTER TABLE refeicoes_extras 
DROP CONSTRAINT IF EXISTS refeicoes_extras_refeicoes_fkey;

-- Add the correct foreign key constraint
ALTER TABLE refeicoes_extras 
ADD CONSTRAINT refeicoes_extras_refeicoes_fkey 
FOREIGN KEY (refeicoes) 
REFERENCES tipos_refeicao(id);

-- Add comment for documentation
COMMENT ON CONSTRAINT refeicoes_extras_refeicoes_fkey ON refeicoes_extras IS 
'Foreign key constraint ensuring refeicoes references a valid tipos_refeicao';