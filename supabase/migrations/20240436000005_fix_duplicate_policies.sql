/* Drop existing policies including the one causing the error */
DROP POLICY IF EXISTS "enforce_voucher_validation_on_insert" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_select_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_update_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_delete_policy" ON uso_voucher;
DROP POLICY IF EXISTS "allow_view_usage_history" ON uso_voucher;

/* Enable RLS */
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

/* Create new insert policy */
CREATE POLICY "enforce_voucher_validation_on_insert" ON uso_voucher
    FOR INSERT TO authenticated, anon
    WITH CHECK (
        current_setting('voucher.validated', true)::boolean = true
    );

/* Create new select policy */
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

/* Ensure proper permissions */
REVOKE ALL ON FUNCTION set_config(text, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION set_config(text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_and_use_voucher(VARCHAR, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_and_use_voucher(VARCHAR, UUID) TO anon;

/* Add documentation */
COMMENT ON POLICY "enforce_voucher_validation_on_insert" ON uso_voucher IS 
'Garante que vouchers só podem ser usados através da função validate_and_use_voucher que implementa todas as validações';

COMMENT ON POLICY "allow_view_usage_history" ON uso_voucher IS 
'Permite que usuários vejam seu próprio histórico e admins vejam todo o histórico';