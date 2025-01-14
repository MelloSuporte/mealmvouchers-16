-- Primeiro, criar uma coluna temporária
ALTER TABLE vouchers_descartaveis 
ADD COLUMN usado_em_temp TIMESTAMP WITH TIME ZONE;

-- Copiar os dados existentes para a nova coluna
UPDATE vouchers_descartaveis 
SET usado_em_temp = CASE 
    WHEN usado_em::text::boolean = true THEN CURRENT_TIMESTAMP 
    ELSE NULL 
END;

-- Remover a coluna antiga
ALTER TABLE vouchers_descartaveis 
DROP COLUMN usado_em;

-- Renomear a coluna temporária
ALTER TABLE vouchers_descartaveis 
RENAME COLUMN usado_em_temp TO usado_em;

-- Recriar os índices se necessário
CREATE INDEX IF NOT EXISTS idx_vouchers_descartaveis_usado_em 
ON vouchers_descartaveis(usado_em);

-- Adicionar comentário explicativo
COMMENT ON COLUMN vouchers_descartaveis.usado_em 
IS 'Data e hora em que o voucher foi utilizado';