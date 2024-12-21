-- Drop existing policies
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;
DROP POLICY IF EXISTS "vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_update_policy" ON vouchers_descartaveis;

-- Enable RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;

-- Create insert policy for uso_voucher with proper validation
CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated, anon
    WITH CHECK (
        -- Validar se o voucher descartável existe e pode ser usado
        voucher_descartavel_id IS NOT NULL
        AND EXISTS (
            SELECT 1 
            FROM vouchers_descartaveis vd
            JOIN tipos_refeicao tr ON tr.id = vd.tipo_refeicao_id
            WHERE vd.id = voucher_descartavel_id
            AND vd.usado_em IS NULL
            AND vd.codigo IS NOT NULL
            AND CURRENT_DATE <= vd.data_expiracao::date
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
            AND vd.tipo_refeicao_id = tipo_refeicao_id
            -- Verificar se não existe uso anterior deste voucher
            AND NOT EXISTS (
                SELECT 1 
                FROM uso_voucher uv 
                WHERE uv.voucher_descartavel_id = vd.id
            )
        )
    );

-- Create select policy for uso_voucher
CREATE POLICY "uso_voucher_select_policy" ON uso_voucher
    FOR SELECT TO authenticated, anon
    USING (
        -- Permitir visualização do histórico
        voucher_descartavel_id IS NOT NULL
    );

-- Create select policy for vouchers_descartaveis
CREATE POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis
    FOR SELECT TO authenticated, anon
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
        AND NOT EXISTS (
            SELECT 1 FROM uso_voucher uv
            WHERE uv.voucher_descartavel_id = id
        )
    );

-- Create update policy for vouchers_descartaveis
CREATE POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis
    FOR UPDATE TO authenticated, anon
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
        AND NOT EXISTS (
            SELECT 1 FROM uso_voucher uv
            WHERE uv.voucher_descartavel_id = id
        )
    )
    WITH CHECK (
        usado_em IS NOT NULL
    );

-- Grant necessary permissions
GRANT SELECT, INSERT ON uso_voucher TO anon;
GRANT SELECT, UPDATE ON vouchers_descartaveis TO anon;

-- Add helpful comments
COMMENT ON POLICY "uso_voucher_insert_policy" ON uso_voucher IS 
'Permite registrar uso de vouchers descartáveis com validações rigorosas de uso único e tipo de refeição';

COMMENT ON POLICY "uso_voucher_select_policy" ON uso_voucher IS 
'Permite visualização do histórico de uso de vouchers';

COMMENT ON POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis IS 
'Permite visualizar apenas vouchers válidos, não utilizados e dentro do horário permitido';

COMMENT ON POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis IS 
'Permite apenas marcar vouchers como usados quando dentro do horário permitido';