-- Drop existing policies if any
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_update_policy" ON uso_voucher;

-- Enable RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Create policies for uso_voucher table
CREATE POLICY "uso_voucher_select_policy"
ON uso_voucher FOR SELECT
TO authenticated
USING (
    usuario_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.role IN ('admin', 'gestor')
        AND NOT au.suspenso
    )
);

CREATE POLICY "uso_voucher_insert_policy"
ON uso_voucher FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.role = 'system'
    )
);

CREATE POLICY "uso_voucher_update_policy"
ON uso_voucher FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.id = auth.uid()
        AND au.role = 'admin'
        AND NOT au.suspenso
    )
);

-- Grant proper permissions
GRANT SELECT, INSERT, UPDATE ON uso_voucher TO authenticated;
GRANT ALL ON uso_voucher TO service_role;