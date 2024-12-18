-- Drop existing policies
DROP POLICY IF EXISTS "enforce_voucher_validation_on_insert" ON uso_voucher;
DROP POLICY IF EXISTS "allow_view_usage_history" ON uso_voucher;

-- Enable RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Create base policies
CREATE POLICY "enforce_voucher_validation_on_insert" ON uso_voucher
    FOR INSERT TO authenticated, anon
    WITH CHECK (
        current_setting('voucher.validated', true)::boolean = true
    );

CREATE POLICY "allow_view_usage_history" ON uso_voucher
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

-- Grant permissions
GRANT SELECT, INSERT ON uso_voucher TO authenticated;
GRANT SELECT, INSERT ON uso_voucher TO anon;

-- Add comments
COMMENT ON POLICY "enforce_voucher_validation_on_insert" ON uso_voucher IS 
'Garante que vouchers só podem ser usados através da função validate_and_use_voucher';

COMMENT ON POLICY "allow_view_usage_history" ON uso_voucher IS 
'Permite que usuários vejam seu próprio histórico e admins vejam todo o histórico';