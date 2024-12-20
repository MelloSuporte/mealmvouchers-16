-- Drop ALL existing policies
DROP POLICY IF EXISTS "vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_update_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "public_vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "public_vouchers_descartaveis_update_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "anon_vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "anon_vouchers_descartaveis_update_policy" ON vouchers_descartaveis;

-- Enable RLS
ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;

-- Create select policy for anonymous users with unique name
CREATE POLICY "anon_vouchers_descartaveis_select_policy_v2" ON vouchers_descartaveis
    FOR SELECT TO anon, authenticated
    USING (
        -- Voucher não usado e dentro da validade
        usado_em IS NULL 
        AND CURRENT_DATE <= data_expiracao::date
        AND codigo IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
    );

-- Create update policy for anonymous users with unique name
CREATE POLICY "anon_vouchers_descartaveis_update_policy_v2" ON vouchers_descartaveis
    FOR UPDATE TO anon, authenticated
    USING (
        usado_em IS NULL 
        AND CURRENT_DATE <= data_expiracao::date
        AND EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
    );

-- Grant necessary permissions to anonymous users
GRANT SELECT, UPDATE ON vouchers_descartaveis TO anon;
GRANT SELECT ON tipos_refeicao TO anon;

-- Add helpful comments
COMMENT ON POLICY "anon_vouchers_descartaveis_select_policy_v2" ON vouchers_descartaveis IS 
'Permite que usuários anônimos visualizem vouchers válidos e não utilizados';

COMMENT ON POLICY "anon_vouchers_descartaveis_update_policy_v2" ON vouchers_descartaveis IS 
'Permite que usuários anônimos marquem vouchers como usados quando dentro do horário permitido';