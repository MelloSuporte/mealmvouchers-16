-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "expired_voucher_cleanup" ON vouchers_descartaveis;

-- Create cleanup function
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

-- Schedule cleanup job
SELECT cron.schedule(
    'cleanup-expired-vouchers',
    '0 0 * * *',
    $$SELECT cleanup_expired_vouchers()$$
);

-- Create cleanup policy
CREATE POLICY "expired_voucher_cleanup" ON vouchers_descartaveis
    FOR DELETE
    USING (
        data_expiracao < CURRENT_DATE
        AND NOT usado
    );

-- Set permissions
GRANT EXECUTE ON FUNCTION cleanup_expired_vouchers() TO authenticated;