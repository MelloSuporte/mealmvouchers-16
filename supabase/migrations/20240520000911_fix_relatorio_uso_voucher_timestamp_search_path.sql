-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_relatorio_uso_voucher_timestamp();

-- Recreate function with fixed search path
CREATE OR REPLACE FUNCTION update_relatorio_uso_voucher_timestamp()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Set proper function ownership and permissions
ALTER FUNCTION update_relatorio_uso_voucher_timestamp() OWNER TO postgres;
REVOKE ALL ON FUNCTION update_relatorio_uso_voucher_timestamp() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_relatorio_uso_voucher_timestamp() TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION update_relatorio_uso_voucher_timestamp() IS 
'Updates timestamp on relatorio_uso_voucher table with proper security settings';