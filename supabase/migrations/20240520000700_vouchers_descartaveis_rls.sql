-- Drop existing policies if they exist
DROP POLICY IF EXISTS "vouchers_descartaveis_generate_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_usage_policy" ON vouchers_descartaveis;

-- Enable RLS
ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;

-- Política para geração de vouchers descartáveis
CREATE POLICY "vouchers_descartaveis_generate_policy" ON vouchers_descartaveis
    FOR INSERT TO authenticated, anon
    WITH CHECK (
        -- Validações básicas
        codigo IS NOT NULL
        AND tipo_refeicao_id IS NOT NULL
        AND data_expiracao IS NOT NULL
        AND data_expiracao >= CURRENT_DATE
        -- Verificar se o tipo de refeição está ativo
        AND EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
        )
    );

-- Política para uso de vouchers descartáveis
CREATE POLICY "vouchers_descartaveis_usage_policy" ON vouchers_descartaveis
    FOR UPDATE TO authenticated, anon
    USING (
        -- Voucher não usado e dentro da validade
        usado_em IS NULL 
        AND data_uso IS NULL
        AND CURRENT_DATE <= data_expiracao::date
        AND codigo IS NOT NULL
        -- Verificar se está dentro do horário permitido
        AND EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
    )
    WITH CHECK (
        -- Garantir que apenas o status de uso seja alterado
        usado_em IS NOT NULL
        AND data_uso IS NOT NULL
        AND EXISTS (
            SELECT 1 
            FROM vouchers_descartaveis v 
            WHERE v.id = id
            AND v.tipo_refeicao_id = tipo_refeicao_id
            AND v.codigo = codigo
            AND v.data_expiracao = data_expiracao
        )
    );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON vouchers_descartaveis TO authenticated;
GRANT SELECT, INSERT, UPDATE ON vouchers_descartaveis TO anon;
GRANT SELECT ON tipos_refeicao TO authenticated;
GRANT SELECT ON tipos_refeicao TO anon;

-- Add helpful comments
COMMENT ON POLICY "vouchers_descartaveis_generate_policy" ON vouchers_descartaveis IS 
'Permite que usuários autenticados e anônimos gerem vouchers descartáveis com validações básicas';

COMMENT ON POLICY "vouchers_descartaveis_usage_policy" ON vouchers_descartaveis IS 
'Permite que usuários autenticados e anônimos usem vouchers descartáveis dentro do horário permitido';