-- Drop the unique constraint if it exists
ALTER TABLE vouchers_extras DROP CONSTRAINT IF EXISTS vouchers_extras_codigo_key;

-- Recreate the index (if it doesn't exist)
DROP INDEX IF EXISTS idx_vouchers_extras_codigo;
CREATE INDEX idx_vouchers_extras_codigo ON vouchers_extras(codigo);

-- Grant necessary permissions
GRANT ALL ON vouchers_extras TO authenticated;
GRANT ALL ON vouchers_extras TO service_role;