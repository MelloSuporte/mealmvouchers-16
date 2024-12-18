-- Update select policy to include meal time validation
DROP POLICY IF EXISTS "vouchers_descartaveis_select_policy" ON vouchers_descartaveis;

CREATE POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis
    FOR SELECT
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
        check_meal_time(tipo_refeicao_id)
    );