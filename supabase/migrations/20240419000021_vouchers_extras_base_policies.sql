-- Base RLS policies for vouchers_extras
ALTER TABLE vouchers_extras ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "vouchers_extras_select_policy" ON vouchers_extras;
DROP POLICY IF EXISTS "vouchers_extras_insert_policy" ON vouchers_extras;
DROP POLICY IF EXISTS "vouchers_extras_update_policy" ON vouchers_extras;

-- Create new unified policies
CREATE POLICY "vouchers_extras_select_policy"
ON vouchers_extras FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "vouchers_extras_insert_policy"
ON vouchers_extras FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "vouchers_extras_update_policy"
ON vouchers_extras FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant proper permissions
GRANT ALL ON vouchers_extras TO authenticated;
GRANT ALL ON vouchers_extras TO service_role;