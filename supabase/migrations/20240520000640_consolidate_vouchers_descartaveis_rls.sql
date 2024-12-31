-- Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_update_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "allow_voucher_descartavel_use" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "public_vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "public_vouchers_descartaveis_update_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "anon_vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "anon_vouchers_descartaveis_update_policy" ON vouchers_descartaveis;

-- Enable RLS
ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;

-- Create unified select policy with proper validation
CREATE POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis AS RESTRICTIVE
    FOR SELECT TO authenticated, anon
    USING (
        -- Voucher não usado e dentro da validade
        usado_em IS NULL 
        AND data_uso IS NULL
        AND CURRENT_DATE <= data_expiracao::date
        AND codigo IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
        AND NOT EXISTS (
            SELECT 1 FROM uso_voucher uv
            WHERE uv.voucher_descartavel_id = vouchers_descartaveis.id
        )
    );

-- Create update policy to allow marking as used
CREATE POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis AS RESTRICTIVE
    FOR UPDATE TO authenticated, anon
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
        AND NOT EXISTS (
            SELECT 1 FROM uso_voucher uv
            WHERE uv.voucher_descartavel_id = vouchers_descartaveis.id
        )
    )
    WITH CHECK (
        usado_em IS NOT NULL
        AND data_uso IS NOT NULL
    );

-- Create policy for uso_voucher to prevent multiple uses
CREATE POLICY "uso_voucher_insert_voucher_descartaveis_policy" ON uso_voucher AS RESTRICTIVE
    FOR INSERT TO authenticated, anon
    WITH CHECK (
        voucher_descartavel_id IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM uso_voucher uv
            WHERE uv.voucher_descartavel_id = voucher_descartavel_id
        )
        AND EXISTS (
            SELECT 1 
            FROM vouchers_descartaveis vd
            JOIN tipos_refeicao tr ON tr.id = vd.tipo_refeicao_id
            WHERE vd.id = voucher_descartavel_id
            AND vd.usado_em IS NULL
            AND vd.data_uso IS NULL
            AND CURRENT_DATE <= vd.data_expiracao::date
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
    );

-- Grant necessary permissions
GRANT SELECT, UPDATE ON vouchers_descartaveis TO anon;
GRANT SELECT, INSERT ON uso_voucher TO anon;
GRANT SELECT ON tipos_refeicao TO anon;

-- Add helpful comments
COMMENT ON POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis IS 
'Permite visualizar apenas vouchers válidos, não utilizados e dentro do horário permitido';

COMMENT ON POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis IS 
'Permite apenas marcar vouchers como usados quando dentro do horário permitido';

COMMENT ON POLICY "uso_voucher_insert_voucher_descartaveis_policy" ON uso_voucher IS 
'Impede o uso múltiplo de vouchers descartáveis e valida horário da refeição';