-- Set timezone for database
ALTER DATABASE postgres SET timezone TO 'America/Sao_Paulo';

-- Atualizar timezone da sessão atual
SET timezone = 'America/Sao_Paulo';

-- Verificar se a mudança foi aplicada
SELECT current_setting('TIMEZONE');

-- Atualizar registros existentes para o novo timezone
UPDATE uso_voucher 
SET usado_em = usado_em AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo'
WHERE usado_em IS NOT NULL;

UPDATE vouchers_descartaveis 
SET data_uso = data_uso AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo',
    data_criacao = data_criacao AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo'
WHERE data_uso IS NOT NULL 
   OR data_criacao IS NOT NULL;

UPDATE vouchers_extras
SET usado_em = usado_em AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo',
    criado_em = criado_em AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo'
WHERE usado_em IS NOT NULL 
   OR criado_em IS NOT NULL;