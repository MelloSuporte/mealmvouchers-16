-- Drop existing policies
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;

-- Enable RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Create unified insert policy with proper NEW reference
CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher AS PERMISSIVE
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'sistema' = 'true'
        )
        AND
        CASE 
            WHEN NEW.voucher_extra_id IS NOT NULL THEN
                EXISTS (
                    SELECT 1 FROM vouchers_extras ve
                    WHERE ve.id = NEW.voucher_extra_id
                    AND NOT ve.usado
                )
            ELSE
                EXISTS (
                    SELECT 1 FROM usuarios u
                    WHERE u.id = NEW.usuario_id
                    AND NOT u.suspenso
                    AND EXISTS (
                        SELECT 1 FROM empresas e
                        WHERE e.id = u.empresa_id
                        AND e.ativo = true
                    )
                )
        END
    );

-- Create select policy
CREATE POLICY "uso_voucher_select_policy" ON uso_voucher AS PERMISSIVE
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND (
                au.permissoes->>'gerenciar_usuarios' = 'true'
                OR au.permissoes->>'sistema' = 'true'
            )
            AND NOT au.suspenso
        )
    );

-- Add comment explaining the policies
COMMENT ON POLICY "uso_voucher_insert_policy" ON uso_voucher 
IS 'Permite inserção apenas pelo sistema, validando voucher comum ou extra';

COMMENT ON POLICY "uso_voucher_select_policy" ON uso_voucher 
IS 'Permite visualização apenas para administradores e sistema';