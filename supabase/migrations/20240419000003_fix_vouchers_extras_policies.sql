-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Vouchers extras visíveis para todos os usuários autenticados" ON vouchers_extras;
DROP POLICY IF EXISTS "Apenas usuários autenticados podem criar vouchers extras" ON vouchers_extras;
DROP POLICY IF EXISTS "Apenas usuários autenticados podem atualizar vouchers extras" ON vouchers_extras;
DROP POLICY IF EXISTS "Vouchers extras são visíveis para todos" ON vouchers_extras;

-- Disable RLS temporarily
ALTER TABLE vouchers_extras DISABLE ROW LEVEL SECURITY;

-- Enable RLS again
ALTER TABLE vouchers_extras ENABLE ROW LEVEL SECURITY;

-- Create new unified policies with proper permissions
CREATE POLICY "vouchers_extras_select"
ON vouchers_extras FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "vouchers_extras_insert"
ON vouchers_extras FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "vouchers_extras_update"
ON vouchers_extras FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON vouchers_extras TO authenticated;
GRANT ALL ON vouchers_extras TO service_role;
GRANT USAGE ON SEQUENCE vouchers_extras_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE vouchers_extras_id_seq TO service_role;