-- Drop existing RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON tipos_refeicao;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON tipos_refeicao;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON tipos_refeicao;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON tipos_refeicao;

-- Enable RLS
ALTER TABLE tipos_refeicao ENABLE ROW LEVEL SECURITY;

-- Create new policies with broader access
CREATE POLICY "Enable read access for all users"
ON tipos_refeicao FOR SELECT
USING (true);

CREATE POLICY "Enable insert for all users"
ON tipos_refeicao FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for all users"
ON tipos_refeicao FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for all users"
ON tipos_refeicao FOR DELETE
USING (true);

-- Grant necessary permissions
GRANT ALL ON tipos_refeicao TO authenticated;
GRANT ALL ON tipos_refeicao TO anon;
GRANT ALL ON tipos_refeicao TO service_role;