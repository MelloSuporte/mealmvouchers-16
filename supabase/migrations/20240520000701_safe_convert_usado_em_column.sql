-- Drop existing policies that depend on usado_em
DROP POLICY IF EXISTS "anon_vouchers_descartaveis_select_policy_v2" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "anon_vouchers_descartaveis_update_policy_v2" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_usage_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "expired_voucher_cleanup_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_pdf_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_update_policy" ON vouchers_descartaveis;

-- Criar uma coluna temporária
ALTER TABLE vouchers_descartaveis 
ADD COLUMN usado_em_temp TIMESTAMP WITH TIME ZONE;

-- Copiar os dados existentes para a nova coluna
UPDATE vouchers_descartaveis 
SET usado_em_temp = CASE 
    WHEN usado_em::text::boolean = true THEN CURRENT_TIMESTAMP 
    ELSE NULL 
END;

-- Remover a coluna antiga
ALTER TABLE vouchers_descartaveis 
DROP COLUMN usado_em;

-- Renomear a coluna temporária
ALTER TABLE vouchers_descartaveis 
RENAME COLUMN usado_em_temp TO usado_em;

-- Recriar os índices
CREATE INDEX IF NOT EXISTS idx_vouchers_descartaveis_usado_em 
ON vouchers_descartaveis(usado_em);

-- Adicionar comentário explicativo
COMMENT ON COLUMN vouchers_descartaveis.usado_em 
IS 'Data e hora em que o voucher foi utilizado';

-- Recriar as políticas com a nova coluna timestamp
CREATE POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis
    FOR SELECT TO authenticated, anon
    USING (
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
    )
    WITH CHECK (
        usado_em IS NOT NULL
    );

CREATE POLICY "expired_voucher_cleanup_policy" ON vouchers_descartaveis
    FOR DELETE
    USING (
        data_expiracao < CURRENT_DATE
        AND usado_em IS NULL
    );

CREATE POLICY "vouchers_descartaveis_pdf_policy" ON vouchers_descartaveis
    FOR SELECT TO authenticated, anon
    USING (
        usado_em IS NULL 
        AND CURRENT_DATE <= data_expiracao::date
        AND codigo IS NOT NULL
    );

-- Grant necessary permissions
GRANT SELECT, UPDATE ON vouchers_descartaveis TO anon;
GRANT SELECT ON tipos_refeicao TO anon;