-- Drop trigger first
DROP TRIGGER IF EXISTS set_voucher_tipo_refeicao ON vouchers_descartaveis;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_voucher_tipo_refeicao;

-- Recreate function with fixed search path
CREATE OR REPLACE FUNCTION update_voucher_tipo_refeicao()
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

-- Set proper ownership and permissions
ALTER FUNCTION update_voucher_tipo_refeicao() OWNER TO postgres;
REVOKE ALL ON FUNCTION update_voucher_tipo_refeicao() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_voucher_tipo_refeicao() TO authenticated;

-- Recreate the trigger
CREATE TRIGGER set_voucher_tipo_refeicao
    BEFORE UPDATE ON vouchers_descartaveis
    FOR EACH ROW
    EXECUTE FUNCTION update_voucher_tipo_refeicao();

-- Add helpful comment
COMMENT ON FUNCTION update_voucher_tipo_refeicao() IS 'Updates the timestamp when a voucher tipo_refeicao is modified';