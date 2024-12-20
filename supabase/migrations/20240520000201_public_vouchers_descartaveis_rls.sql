-- Remover políticas existentes para página pública
DROP POLICY IF EXISTS "public_vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "public_vouchers_descartaveis_update_policy" ON vouchers_descartaveis;

-- Habilitar RLS
ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;

-- Política para VISUALIZAR vouchers (página Voucher)
CREATE POLICY "public_vouchers_descartaveis_select_policy" ON vouchers_descartaveis
    FOR SELECT TO anon
    USING (
        -- Voucher não usado e dentro da validade
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

-- Política para USAR vouchers (página Voucher)
CREATE POLICY "public_vouchers_descartaveis_update_policy" ON vouchers_descartaveis
    FOR UPDATE TO anon
    USING (
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
        -- Permitir apenas marcar como usado sem alterar outros campos
        usado = true
    );

-- Adicionar comentários explicativos
COMMENT ON POLICY "public_vouchers_descartaveis_select_policy" ON vouchers_descartaveis IS 
'Permite que qualquer pessoa visualize vouchers válidos e não utilizados';

COMMENT ON POLICY "public_vouchers_descartaveis_update_policy" ON vouchers_descartaveis IS 
'Permite que qualquer pessoa use um voucher válido dentro do horário permitido';

-- Conceder permissões necessárias
GRANT SELECT, UPDATE ON vouchers_descartaveis TO anon;