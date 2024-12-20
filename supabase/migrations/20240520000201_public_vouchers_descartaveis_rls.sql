-- Remove existing policies
DROP POLICY IF EXISTS "public_vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "public_vouchers_descartaveis_update_policy" ON vouchers_descartaveis;

/* Enable Row Level Security */
ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;

/* Policy for viewing vouchers (public page) */
CREATE POLICY "public_vouchers_descartaveis_select_policy" ON vouchers_descartaveis
    FOR SELECT TO anon
    USING (
        /* Ensure voucher is unused and valid */
        NOT usado 
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

/* Policy for using vouchers (public page) */
CREATE POLICY "public_vouchers_descartaveis_update_policy" ON vouchers_descartaveis
    FOR UPDATE TO anon
    USING (
        /* Check if voucher can be used */
        NOT usado 
        AND CURRENT_DATE <= data_expiracao::date
        AND EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
    )
    WITH CHECK (
        /* Only allow marking as used while preserving other fields */
        usado = true
        AND NEW.id = OLD.id
        AND NEW.tipo_refeicao_id = OLD.tipo_refeicao_id
        AND NEW.codigo = OLD.codigo
        AND NEW.data_expiracao = OLD.data_expiracao
        /* Ensure meal type matches and is within allowed time */
        AND EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = NEW.tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
    );

COMMENT ON POLICY "public_vouchers_descartaveis_select_policy" ON vouchers_descartaveis IS 
'Allows anyone to view valid and unused vouchers';

COMMENT ON POLICY "public_vouchers_descartaveis_update_policy" ON vouchers_descartaveis IS 
'Allows anyone to use a valid voucher only once, within allowed time and for the correct meal type';

/* Grant necessary permissions */
GRANT SELECT, UPDATE ON vouchers_descartaveis TO anon;