-- Enable RLS
ALTER TABLE refeicoes ENABLE ROW LEVEL SECURITY;

-- Create policy for SELECT operations
CREATE POLICY "refeicoes_select_policy" ON refeicoes
    FOR SELECT USING (true);

-- Create policy for INSERT operations
CREATE POLICY "refeicoes_insert_policy" ON refeicoes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.id = auth.uid()
            AND NOT au.suspenso
        )
    );

-- Create policy for UPDATE operations
CREATE POLICY "refeicoes_update_policy" ON refeicoes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.id = auth.uid()
            AND NOT au.suspenso
        )
    );

-- Grant necessary permissions
GRANT ALL ON refeicoes TO authenticated;
GRANT ALL ON refeicoes TO anon;