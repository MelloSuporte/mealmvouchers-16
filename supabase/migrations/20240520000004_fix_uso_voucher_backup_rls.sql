-- Enable RLS on uso_voucher_backup table
ALTER TABLE uso_voucher_backup ENABLE ROW LEVEL SECURITY;

-- Create select policy for uso_voucher_backup
CREATE POLICY "uso_voucher_backup_select_policy" ON uso_voucher_backup
    FOR SELECT TO authenticated
    USING (
        usuario_id = auth.uid()
        OR 
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

-- Create insert policy for uso_voucher_backup
CREATE POLICY "uso_voucher_backup_insert_policy" ON uso_voucher_backup
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

-- Create update policy for uso_voucher_backup
CREATE POLICY "uso_voucher_backup_update_policy" ON uso_voucher_backup
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

-- Create delete policy for uso_voucher_backup
CREATE POLICY "uso_voucher_backup_delete_policy" ON uso_voucher_backup
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

-- Grant proper permissions
GRANT SELECT ON uso_voucher_backup TO authenticated;

-- Add comments
COMMENT ON TABLE uso_voucher_backup IS 'Backup table for uso_voucher records';
COMMENT ON POLICY "uso_voucher_backup_select_policy" ON uso_voucher_backup IS 'Users can only view their own records, admins can view all';
COMMENT ON POLICY "uso_voucher_backup_insert_policy" ON uso_voucher_backup IS 'Only admins can insert records';
COMMENT ON POLICY "uso_voucher_backup_update_policy" ON uso_voucher_backup IS 'Only admins can update records';
COMMENT ON POLICY "uso_voucher_backup_delete_policy" ON uso_voucher_backup IS 'Only admins can delete records';