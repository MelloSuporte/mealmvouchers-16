-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON empresas;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON empresas;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON empresas;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON empresas;

-- Enable RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Public read access"
ON empresas FOR SELECT
USING (true);

CREATE POLICY "Insert access for authenticated users"
ON empresas FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Update access for authenticated users"
ON empresas FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Delete access for authenticated users"
ON empresas FOR DELETE
USING (auth.role() = 'authenticated');