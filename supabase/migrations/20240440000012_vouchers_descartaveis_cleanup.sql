-- Criar extensão pg_cron se não existir
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Função para limpar vouchers expirados
CREATE OR REPLACE FUNCTION cleanup_expired_vouchers()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM vouchers_descartaveis
    WHERE NOT usado 
    AND data_expiracao < CURRENT_DATE;
END;
$$;

-- Política para permitir exclusão de vouchers expirados
CREATE POLICY "expired_voucher_cleanup_policy" ON vouchers_descartaveis
    FOR DELETE
    USING (
        data_expiracao < CURRENT_DATE
        AND NOT usado
    );

-- Agendar limpeza diária
SELECT cron.schedule(
    'cleanup-expired-vouchers',
    '0 0 * * *',
    $$SELECT cleanup_expired_vouchers()$$
);

-- Permissões
REVOKE ALL ON FUNCTION cleanup_expired_vouchers() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION cleanup_expired_vouchers() TO authenticated;

-- Comentário
COMMENT ON FUNCTION cleanup_expired_vouchers IS 
'Remove vouchers expirados e não utilizados do banco de dados';