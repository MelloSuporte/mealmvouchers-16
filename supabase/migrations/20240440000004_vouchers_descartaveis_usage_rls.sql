-- Drop existing policies if they exist
DROP POLICY IF EXISTS "allow_voucher_descartavel_use" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "prevent_voucher_reuse" ON vouchers_descartaveis;

-- Enable RLS
ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;

-- Create function to validate meal time
CREATE OR REPLACE FUNCTION check_meal_time_for_voucher(
    p_tipo_refeicao_id UUID,
    p_hora_atual TIME DEFAULT CURRENT_TIME
) RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_hora_inicio TIME;
    v_hora_fim TIME;
    v_tolerancia INTEGER;
BEGIN
    -- Get meal time configuration
    SELECT 
        hora_inicio,
        hora_fim,
        minutos_tolerancia
    INTO 
        v_hora_inicio,
        v_hora_fim,
        v_tolerancia
    FROM tipos_refeicao
    WHERE id = p_tipo_refeicao_id
    AND ativo = true;

    -- Check if current time is within allowed range (including tolerance)
    RETURN p_hora_atual BETWEEN v_hora_inicio 
        AND v_hora_fim + (v_tolerancia || ' minutes')::INTERVAL;
END;
$$;

-- Policy to allow voucher use
CREATE POLICY "allow_voucher_descartavel_use" ON vouchers_descartaveis
    FOR SELECT
    TO authenticated
    USING (
        -- Voucher must not be used
        NOT usado
        AND
        -- Voucher must be valid for today
        CURRENT_DATE <= data_expiracao::date
        AND
        -- Voucher code must be 4 digits
        length(codigo) = 4
        AND codigo ~ '^\d{4}$'
        AND
        -- Check meal time
        check_meal_time_for_voucher(tipo_refeicao_id)
    );

-- Policy to prevent voucher reuse
CREATE POLICY "prevent_voucher_reuse" ON vouchers_descartaveis
    FOR UPDATE
    TO authenticated
    USING (NOT usado)
    WITH CHECK (
        -- Only allow marking as used
        usado = true
        AND
        -- Must be the same voucher
        id = OLD.id
        AND
        -- Must not be already used
        NOT OLD.usado
    );

-- Grant necessary permissions
GRANT SELECT, UPDATE ON vouchers_descartaveis TO authenticated;
GRANT EXECUTE ON FUNCTION check_meal_time_for_voucher TO authenticated;

-- Add helpful comments
COMMENT ON POLICY "allow_voucher_descartavel_use" ON vouchers_descartaveis IS 
'Allows authenticated users to view and use valid, unused 4-digit vouchers during meal times';

COMMENT ON POLICY "prevent_voucher_reuse" ON vouchers_descartaveis IS 
'Prevents voucher reuse by only allowing update to mark as used';

COMMENT ON FUNCTION check_meal_time_for_voucher IS 
'Validates if current time is within allowed meal time range including tolerance';