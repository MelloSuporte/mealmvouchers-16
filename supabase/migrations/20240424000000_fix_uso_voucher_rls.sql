-- Drop existing policies
DROP POLICY IF EXISTS "uso_voucher_comum_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_comum_select_policy" ON uso_voucher;

-- Enable RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "uso_voucher_comum_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'sistema' = 'true'
        )
    );

CREATE POLICY "uso_voucher_comum_select_policy" ON uso_voucher
    FOR SELECT TO authenticated
    USING (
        usuario_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_usuarios' = 'true'
            AND NOT au.suspenso
        )
    );

-- Add comments
COMMENT ON POLICY "uso_voucher_comum_insert_policy" ON uso_voucher IS 'Controla registro de uso de vouchers comuns';
COMMENT ON POLICY "uso_voucher_comum_select_policy" ON uso_voucher IS 'Controla visualização do histórico de uso';