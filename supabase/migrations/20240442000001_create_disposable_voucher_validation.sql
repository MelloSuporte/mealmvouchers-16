-- Create disposable voucher validation function
CREATE OR REPLACE FUNCTION validate_disposable_voucher(
    p_codigo VARCHAR(4),
    p_tipo_refeicao_id UUID
) RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_voucher RECORD;
    v_validation_result JSONB;
BEGIN
    -- Validate base conditions first
    v_validation_result := validate_voucher_base(p_codigo, p_tipo_refeicao_id);
    IF NOT (v_validation_result->>'success')::boolean THEN
        RETURN v_validation_result;
    END IF;

    -- Try to find and lock a valid disposable voucher
    SELECT *
    INTO v_voucher
    FROM vouchers_descartaveis
    WHERE codigo = p_codigo
    AND tipo_refeicao_id = p_tipo_refeicao_id
    AND NOT usado
    AND CURRENT_DATE <= data_expiracao::date
    FOR UPDATE SKIP LOCKED;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Voucher descartável não encontrado ou já utilizado'
        );
    END IF;

    -- Mark voucher as used
    UPDATE vouchers_descartaveis
    SET 
        usado = true,
        data_uso = CURRENT_TIMESTAMP
    WHERE id = v_voucher.id
    AND NOT usado;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Voucher já foi utilizado'
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Voucher descartável validado com sucesso'
    );
END;
$$;