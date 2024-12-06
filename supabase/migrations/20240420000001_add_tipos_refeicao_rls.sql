-- Enable RLS on tipos_refeicao table
ALTER TABLE tipos_refeicao ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read tipos_refeicao
CREATE POLICY "Allow authenticated users to read tipos_refeicao"
ON tipos_refeicao
FOR SELECT
TO authenticated, anon
USING (true);

-- Create policy to allow authenticated users to insert tipos_refeicao
CREATE POLICY "Allow authenticated users to insert tipos_refeicao"
ON tipos_refeicao
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow authenticated users to update tipos_refeicao
CREATE POLICY "Allow authenticated users to update tipos_refeicao"
ON tipos_refeicao
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy to allow authenticated users to delete tipos_refeicao
CREATE POLICY "Allow authenticated users to delete tipos_refeicao"
ON tipos_refeicao
FOR DELETE
TO authenticated
USING (true);

-- Grant necessary permissions
GRANT ALL ON tipos_refeicao TO authenticated;
GRANT SELECT ON tipos_refeicao TO anon;
GRANT ALL ON tipos_refeicao TO service_role;