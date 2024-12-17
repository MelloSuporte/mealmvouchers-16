-- Fix search_path security issue in update_relatorio_uso_voucher_timestamp function
CREATE OR REPLACE FUNCTION public.update_relatorio_uso_voucher_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Drop and recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS update_relatorio_uso_voucher_timestamp_trigger ON relatorio_uso_voucher;

CREATE TRIGGER update_relatorio_uso_voucher_timestamp_trigger
    BEFORE UPDATE ON relatorio_uso_voucher
    FOR EACH ROW
    EXECUTE FUNCTION update_relatorio_uso_voucher_timestamp();

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS relatorio_uso_voucher ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.update_relatorio_uso_voucher_timestamp() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_relatorio_uso_voucher_timestamp() TO service_role;