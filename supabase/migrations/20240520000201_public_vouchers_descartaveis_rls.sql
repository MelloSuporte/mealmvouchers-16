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
        -- Garantir que o voucher não foi usado e está dentro da validade
        NOT usado 
        AND CURRENT_DATE <= data_expiracao::date
        -- Validar tipo de refeição e horário
        AND EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
    )
    WITH CHECK (
        -- Permitir apenas marcar como usado e manter outros campos inalterados
        usado = true
        AND NEW.id = OLD.id
        AND NEW.tipo_refeicao_id = OLD.tipo_refeicao_id
        AND NEW.codigo = OLD.codigo
        AND NEW.data_expiracao = OLD.data_expiracao
        -- Garantir que o tipo de refeição corresponde ao voucher
        AND EXISTS (
            SELECT 1 FROM tipos_refeicao tr
            WHERE tr.id = NEW.tipo_refeicao_id
            AND tr.ativo = true
            AND CURRENT_TIME BETWEEN tr.horario_inicio 
            AND (tr.horario_fim + (tr.minutos_tolerancia || ' minutes')::INTERVAL)
        )
    );

-- Adicionar comentários explicativos
COMMENT ON POLICY "public_vouchers_descartaveis_select_policy" ON vouchers_descartaveis IS 
'Permite que qualquer pessoa visualize vouchers válidos e não utilizados';

COMMENT ON POLICY "public_vouchers_descartaveis_update_policy" ON vouchers_descartaveis IS 
'Permite que qualquer pessoa use um voucher válido apenas uma vez, dentro do horário permitido e para o tipo de refeição correto';

-- Conceder permissões necessárias
GRANT SELECT, UPDATE ON vouchers_descartaveis TO anon;