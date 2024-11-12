-- Drop existing policies
DROP POLICY IF EXISTS "Public read access" ON empresas;
DROP POLICY IF EXISTS "Insert access for authenticated users" ON empresas;
DROP POLICY IF EXISTS "Update access for authenticated users" ON empresas;
DROP POLICY IF EXISTS "Delete access for authenticated users" ON empresas;

-- Enable RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Create development policies (less restrictive)
CREATE POLICY "Allow all operations in development"
ON empresas
FOR ALL
USING (true)
WITH CHECK (true);