-- Drop existing function
DROP FUNCTION IF EXISTS update_voucher_extra_status;

-- Recreate function with explicit search_path
CREATE OR REPLACE FUNCTION update_voucher_extra_status(
    p_voucher_id INTEGER,
    p_usado BOOLEAN,
    p_usado_em TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS vouchers_extras
SECURITY INVOKER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_result vouchers_extras;
    v_current_status BOOLEAN;
BEGIN
    -- Verificar se o voucher existe e obter status atual
    SELECT usado INTO v_current_status
    FROM vouchers_extras
    WHERE id = p_voucher_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Voucher não encontrado';
    END IF;

    -- Verificar se não está tentando "desusar" um voucher
    IF v_current_status AND NOT p_usado THEN
        RAISE EXCEPTION 'Não é permitido reverter o uso de um voucher';
    END IF;

    -- Verificar se o voucher já foi usado
    IF v_current_status AND p_usado THEN
        RAISE EXCEPTION 'Voucher já foi utilizado';
    END IF;

    -- Verificar se o voucher não está expirado
    IF EXISTS (
        SELECT 1
        FROM vouchers_extras
        WHERE id = p_voucher_id
        AND valido_ate < CURRENT_DATE
    ) THEN
        RAISE EXCEPTION 'Voucher expirado';
    END IF;

    -- Atualizar o status do voucher
    UPDATE vouchers_extras
    SET 
        usado = p_usado,
        usado_em = CASE 
            WHEN p_usado THEN COALESCE(p_usado_em, CURRENT_TIMESTAMP)
            ELSE NULL
        END
    WHERE id = p_voucher_id
    RETURNING * INTO v_result;

    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao atualizar voucher: %', SQLERRM;
END;
$$;

-- Set function permissions
REVOKE ALL ON FUNCTION update_voucher_extra_status FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_voucher_extra_status TO authenticated;

-- Add comment
COMMENT ON FUNCTION update_voucher_extra_status IS 'Atualiza o status de uso de um voucher extra com validações de segurança';
