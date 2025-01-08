-- Drop existing foreign key constraint if it exists
ALTER TABLE IF EXISTS refeicoes_extras 
DROP CONSTRAINT IF EXISTS refeicoes_extras_tipo_refeicao_id_fkey;

-- Add new column refeicoes
ALTER TABLE refeicoes_extras 
ADD COLUMN IF NOT EXISTS refeicoes UUID REFERENCES tipos_refeicao(id);

-- Copy data from tipo_refeicao_id to refeicoes
UPDATE refeicoes_extras 
SET refeicoes = tipo_refeicao_id 
WHERE tipo_refeicao_id IS NOT NULL;

-- Drop old column
ALTER TABLE refeicoes_extras 
DROP COLUMN IF EXISTS tipo_refeicao_id;

-- Add index on refeicoes column
CREATE INDEX IF NOT EXISTS idx_refeicoes_extras_refeicoes 
ON refeicoes_extras(refeicoes);

COMMENT ON COLUMN refeicoes_extras.refeicoes IS 'Reference to tipos_refeicao table';