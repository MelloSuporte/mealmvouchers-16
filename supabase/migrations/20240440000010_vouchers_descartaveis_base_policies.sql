-- Remover políticas existentes
DROP POLICY IF EXISTS "allow_voucher_descartavel_use" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "prevent_voucher_reuse" ON vouchers_descartaveis;

-- Habilitar RLS
ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;

-- Política para seleção de vouchers
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
    );

-- Política para atualização (marcar como usado)
CREATE POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis
    FOR UPDATE
    USING (NOT usado)
    WITH CHECK (
        usado = true
        AND id = id
        AND tipo_refeicao_id = tipo_refeicao_id
        AND codigo = codigo
        AND data_expiracao = data_expiracao
    );

-- Comentários
COMMENT ON POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis IS 
'Permite visualizar vouchers válidos e não utilizados';

COMMENT ON POLICY "vouchers_descartaveis_update_policy" ON vouchers_descartaveis IS 
'Permite apenas marcar vouchers como usados';