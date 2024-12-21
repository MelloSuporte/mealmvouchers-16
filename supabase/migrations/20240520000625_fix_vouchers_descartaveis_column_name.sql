-- Drop existing policy if it exists
DROP POLICY IF EXISTS "allow_voucher_descartavel_use" ON vouchers_descartaveis;

-- Create new policy with correct column names
CREATE POLICY "allow_voucher_descartavel_use" ON vouchers_descartaveis
    FOR SELECT
    USING (
        usado_em IS NULL 
        AND data_uso IS NULL
        AND CURRENT_DATE <= data_expiracao::date
        AND EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
    );

-- Add helpful comment
COMMENT ON POLICY "allow_voucher_descartavel_use" ON vouchers_descartaveis IS 
'Permite selecionar apenas vouchers não utilizados, dentro da validade e no horário permitido';