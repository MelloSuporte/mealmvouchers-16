-- Remover políticas existentes
DROP POLICY IF EXISTS "vouchers_descartaveis_select_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_update_policy" ON vouchers_descartaveis;
DROP POLICY IF EXISTS "vouchers_descartaveis_insert_policy" ON vouchers_descartaveis;

-- Habilitar RLS
ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;

-- Política para GERAR vouchers (área administrativa)
CREATE POLICY "admin_vouchers_descartaveis_insert_policy" ON vouchers_descartaveis
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'gestor')
            AND NOT u.suspenso
        )
    );

-- Política para VISUALIZAR vouchers (página Voucher)
CREATE POLICY "public_vouchers_descartaveis_select_policy" ON vouchers_descartaveis
    FOR SELECT TO authenticated
    USING (
        -- Qualquer pessoa pode ver vouchers não usados e válidos
        NOT usado 
        AND CURRENT_DATE <= data_expiracao::date
        AND codigo IS NOT NULL
    );

-- Política para USAR vouchers (página Voucher)
CREATE POLICY "public_vouchers_descartaveis_update_policy" ON vouchers_descartaveis
    FOR UPDATE TO authenticated
    USING (
        -- Qualquer pessoa pode usar vouchers não usados e válidos
        NOT usado 
        AND CURRENT_DATE <= data_expiracao::date
    )
    WITH CHECK (
        -- Só permite marcar como usado
        usado = true
        AND NEW.id = OLD.id
        AND NEW.tipo_refeicao_id = OLD.tipo_refeicao_id
        AND NEW.codigo = OLD.codigo
        AND NEW.data_expiracao = OLD.data_expiracao
    );

-- Adicionar comentários explicativos
COMMENT ON POLICY "admin_vouchers_descartaveis_insert_policy" ON vouchers_descartaveis IS 
'Permite apenas administradores e gestores criarem novos vouchers';

COMMENT ON POLICY "public_vouchers_descartaveis_select_policy" ON vouchers_descartaveis IS 
'Permite que qualquer usuário autenticado visualize vouchers válidos e não utilizados';

COMMENT ON POLICY "public_vouchers_descartaveis_update_policy" ON vouchers_descartaveis IS 
'Permite que qualquer usuário autenticado use um voucher válido';