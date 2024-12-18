-- Conceder permissões necessárias
GRANT SELECT, UPDATE, DELETE ON vouchers_descartaveis TO authenticated;

-- Atualizar política de seleção para incluir validação de horário
DROP POLICY IF EXISTS "vouchers_descartaveis_select_policy" ON vouchers_descartaveis;

CREATE POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis
    FOR SELECT
    USING (
        -- Voucher não deve estar usado
        NOT usado
        AND
        -- Voucher deve ser válido para hoje
        CURRENT_DATE <= data_expiracao::date
        AND
        -- Código do voucher deve ter 4 dígitos
        length(codigo) = 4 
        AND codigo ~ '^\d{4}$'
        AND
        -- Verificar horário da refeição
        check_meal_time(tipo_refeicao_id)
    );

-- Comentário
COMMENT ON POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis IS 
'Permite visualizar vouchers válidos, não utilizados e dentro do horário permitido';