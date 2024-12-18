-- Create usage log function
CREATE OR REPLACE FUNCTION log_voucher_usage(
    p_voucher_id UUID,
    p_tipo_refeicao_id UUID
) RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO uso_voucher (
        voucher_descartavel_id,
        tipo_refeicao_id,
        usado_em
    ) VALUES (
        p_voucher_id,
        p_tipo_refeicao_id,
        CURRENT_TIMESTAMP
    );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION log_voucher_usage TO authenticated;

-- Add comment
COMMENT ON FUNCTION log_voucher_usage IS 'Logs the usage of a disposable voucher';