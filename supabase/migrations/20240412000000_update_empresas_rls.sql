-- Drop existing policies
DROP POLICY IF EXISTS "Public read access" ON empresas;
DROP POLICY IF EXISTS "Insert access for authenticated users" ON empresas;
DROP POLICY IF EXISTS "Update access for authenticated users" ON empresas;
DROP POLICY IF EXISTS "Delete access for authenticated users" ON empresas;
DROP POLICY IF EXISTS "Allow all operations in development" ON empresas;

-- Enable RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Create development policies for Admin Master
CREATE POLICY "Admin Master Full Access"
ON empresas
FOR ALL
USING (
  auth.role() = 'service_role' OR 
  auth.role() = 'authenticated' OR 
  EXISTS (
    SELECT 1
    FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin_master'
  )
)
WITH CHECK (
  auth.role() = 'service_role' OR 
  auth.role() = 'authenticated' OR 
  EXISTS (
    SELECT 1
    FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin_master'
  )
);