-- Drop existing RLS policies for tipos_refeicao if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read tipos_refeicao" ON tipos_refeicao;
DROP POLICY IF EXISTS "Allow authenticated users to insert tipos_refeicao" ON tipos_refeicao;
DROP POLICY IF EXISTS "Allow authenticated users to update tipos_refeicao" ON tipos_refeicao;
DROP POLICY IF EXISTS "Allow authenticated users to delete tipos_refeicao" ON tipos_refeicao;

-- Enable RLS
ALTER TABLE tipos_refeicao ENABLE ROW LEVEL SECURITY;

-- Create policies for tipos_refeicao
CREATE POLICY "Enable read access for all users"
ON tipos_refeicao FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON tipos_refeicao FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
ON tipos_refeicao FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only"
ON tipos_refeicao FOR DELETE
TO authenticated
USING (true);

-- Grant necessary permissions
GRANT ALL ON tipos_refeicao TO authenticated;
GRANT SELECT ON tipos_refeicao TO anon;
GRANT ALL ON tipos_refeicao TO service_role;