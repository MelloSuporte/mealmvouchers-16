-- Drop existing function
DROP FUNCTION IF EXISTS validate_and_use_voucher CASCADE;

-- Create updated main validation function
CREATE OR REPLACE FUNCTION validate_and_use_voucher(
    p_codigo VARCHAR(4),
    p_tipo_refeicao_id UUID
) RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Try disposable voucher first
    v_result := validate_disposable_voucher(p_codigo, p_tipo_refeicao_id);
    
    IF (v_result->>'success')::boolean THEN
        RETURN v_result;
    END IF;

    -- If not a valid disposable voucher, try common voucher
    IF v_result->>'error' = 'Voucher descartável não encontrado ou já utilizado' THEN
        RETURN validate_common_voucher(p_codigo, p_tipo_refeicao_id);
    END IF;

    -- Return the original error if it's not about voucher not found
    RETURN v_result;
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION validate_and_use_voucher FROM PUBLIC;
GRANT EXECUTE ON FUNCTION validate_and_use_voucher TO authenticated;
GRANT EXECUTE ON FUNCTION validate_and_use_voucher TO anon;

-- Add helpful comment
COMMENT ON FUNCTION validate_and_use_voucher IS 'Validates and uses vouchers, trying disposable vouchers first, then common vouchers';