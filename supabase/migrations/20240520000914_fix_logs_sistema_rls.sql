-- Drop existing policies
DROP POLICY IF EXISTS "logs_sistema_insert_policy" ON logs_sistema;
DROP POLICY IF EXISTS "logs_sistema_select_policy" ON logs_sistema;

-- Enable RLS
ALTER TABLE logs_sistema ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "logs_sistema_insert_policy" ON logs_sistema
    FOR INSERT TO authenticated, anon
    WITH CHECK (true);

CREATE POLICY "logs_sistema_select_policy" ON logs_sistema
    FOR SELECT TO authenticated, anon
    USING (true);

-- Grant necessary permissions
GRANT INSERT ON logs_sistema TO authenticated, anon;
GRANT SELECT ON logs_sistema TO authenticated, anon;