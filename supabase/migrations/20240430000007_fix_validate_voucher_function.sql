-- Drop existing function if exists
DROP FUNCTION IF EXISTS validate_voucher_comum;

-- Create new validation function for common vouchers
CREATE OR REPLACE FUNCTION validate_voucher_comum(
    p_voucher VARCHAR(4)
)
RETURNS TABLE (
    usuario_id UUID,
    nome VARCHAR,
    empresa_id UUID,
    turno_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.nome,
        u.empresa_id,
        u.turno_id
    FROM usuarios u
    WHERE u.voucher = p_voucher
    AND NOT u.suspenso
    AND EXISTS (
        SELECT 1 FROM empresas e 
        WHERE e.id = u.empresa_id 
        AND e.ativo = true
    );

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Voucher inválido ou usuário suspenso';
    END IF;
END;
$$;

-- Add comment
COMMENT ON FUNCTION validate_voucher_comum IS 'Valida voucher comum pelo código de 4 dígitos';