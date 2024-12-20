-- Remover políticas existentes para área administrativa
DROP POLICY IF EXISTS "admin_vouchers_descartaveis_insert_policy" ON vouchers_descartaveis;

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

-- Adicionar comentário explicativo
COMMENT ON POLICY "admin_vouchers_descartaveis_insert_policy" ON vouchers_descartaveis IS 
'Permite apenas administradores e gestores criarem novos vouchers';