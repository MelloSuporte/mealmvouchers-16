-- First, ensure we have the necessary permissions
GRANT ALL ON vouchers_extras TO postgres;

-- Drop any existing constraints and indices
ALTER TABLE vouchers_extras DROP CONSTRAINT IF EXISTS vouchers_extras_codigo_key;
ALTER TABLE vouchers_extras DROP CONSTRAINT IF EXISTS vouchers_extras_codigo_unique;

-- Drop and recreate the index as non-unique
DROP INDEX IF EXISTS idx_vouchers_extras_codigo;
CREATE INDEX idx_vouchers_extras_codigo ON vouchers_extras(codigo);

-- Grant necessary permissions
GRANT ALL ON vouchers_extras TO authenticated;
GRANT ALL ON vouchers_extras TO service_role;

-- Verify no unique constraints exist
DO $$
BEGIN
    EXECUTE 'ALTER TABLE vouchers_extras DROP CONSTRAINT IF EXISTS ' || 
            quote_ident(conname)
    FROM pg_constraint 
    WHERE conrelid = 'vouchers_extras'::regclass 
    AND contype = 'u' 
    AND conname LIKE '%codigo%';
END $$;