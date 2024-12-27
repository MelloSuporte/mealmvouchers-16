-- Drop existing trigger and function
DROP TRIGGER IF EXISTS validate_voucher_usage_trigger ON uso_voucher;
DROP FUNCTION IF EXISTS trigger_validate_voucher_usage();

-- Recreate trigger function with explicit search_path
CREATE OR REPLACE FUNCTION trigger_validate_voucher_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT validate_voucher_usage(NEW.usuario_id, NEW.tipo_refeicao_id) THEN
        RETURN NULL;
    END IF;
    RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER validate_voucher_usage_trigger
    BEFORE INSERT ON uso_voucher
    FOR EACH ROW
    EXECUTE FUNCTION trigger_validate_voucher_usage();

-- Grant necessary permissions
REVOKE ALL ON FUNCTION trigger_validate_voucher_usage() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION trigger_validate_voucher_usage() TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION trigger_validate_voucher_usage() IS 'Trigger function to validate voucher usage with fixed search_path';