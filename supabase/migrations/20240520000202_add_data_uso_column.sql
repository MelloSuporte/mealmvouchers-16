-- Primeiro remover a coluna se ela existir (para evitar conflitos de tipo)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'vouchers_extras' 
        AND column_name = 'data_uso'
    ) THEN
        ALTER TABLE vouchers_extras DROP COLUMN data_uso;
    END IF;
END $$;

-- Adicionar a coluna com o tipo correto
ALTER TABLE vouchers_extras 
ADD COLUMN data_uso TIMESTAMP WITH TIME ZONE;

-- Adicionar comentário explicativo
COMMENT ON COLUMN vouchers_extras.data_uso IS 'Data e hora em que o voucher extra foi utilizado';

-- Atualizar registros existentes usando o nome correto da coluna
UPDATE vouchers_extras 
SET data_uso = usado_em 
WHERE usado_em IS NOT NULL AND data_uso IS NULL;