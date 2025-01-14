-- Create function to register disposable voucher usage
CREATE OR REPLACE FUNCTION register_disposable_voucher_usage(
    p_voucher_id UUID,
    p_tipo_refeicao_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get current timestamp
    v_timestamp := CURRENT_TIMESTAMP;

    -- Insert usage record
    INSERT INTO uso_voucher (
        voucher_descartavel_id,
        tipo_refeicao_id,
        tipo_voucher,
        usado_em
    ) VALUES (
        p_voucher_id,
        p_tipo_refeicao_id,
        'descartavel',
        v_timestamp
    );

    -- Update voucher status
    UPDATE vouchers_descartaveis
    SET usado_em = v_timestamp,
        data_uso = v_timestamp,
        usado = true
    WHERE id = p_voucher_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Voucher registrado com sucesso'
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION register_disposable_voucher_usage TO authenticated;
GRANT EXECUTE ON FUNCTION register_disposable_voucher_usage TO anon;

-- Add comment
COMMENT ON FUNCTION register_disposable_voucher_usage IS 'Registra o uso de um voucher descartável em uma única transação';