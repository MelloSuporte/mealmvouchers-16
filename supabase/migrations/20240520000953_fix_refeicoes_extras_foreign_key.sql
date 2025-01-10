-- Drop existing foreign key constraint
ALTER TABLE refeicoes_extras 
DROP CONSTRAINT IF EXISTS refeicoes_extras_refeicoes_fkey;

-- Add the correct foreign key constraint pointing to refeicoes table
ALTER TABLE refeicoes_extras 
ADD CONSTRAINT refeicoes_extras_refeicoes_fkey 
FOREIGN KEY (refeicoes) 
REFERENCES refeicoes(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Add helpful comments
COMMENT ON CONSTRAINT refeicoes_extras_refeicoes_fkey ON refeicoes_extras IS 
'Foreign key constraint ensuring refeicoes references a valid refeicao';