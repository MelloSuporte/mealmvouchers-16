-- Adicionar coluna data_uso à tabela vouchers_extras
ALTER TABLE vouchers_extras 
ADD COLUMN IF NOT EXISTS data_uso TIMESTAMP WITH TIME ZONE;

-- Adicionar comentário explicativo
COMMENT ON COLUMN vouchers_extras.data_uso IS 'Data e hora em que o voucher extra foi utilizado';

-- Atualizar registros existentes usando o nome correto da coluna
UPDATE vouchers_extras 
SET data_uso = usado_em 
WHERE usado_em IS NOT NULL AND data_uso IS NULL;