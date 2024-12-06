-- Enable RLS on turnos table
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read turnos
CREATE POLICY "Allow authenticated users to read turnos"
ON turnos
FOR SELECT
TO authenticated, anon
USING (true);

-- Create policy to allow authenticated users to insert turnos
CREATE POLICY "Allow authenticated users to insert turnos"
ON turnos
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow authenticated users to update turnos
CREATE POLICY "Allow authenticated users to update turnos"
ON turnos
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy to allow authenticated users to delete turnos
CREATE POLICY "Allow authenticated users to delete turnos"
ON turnos
FOR DELETE
TO authenticated
USING (true);

-- Grant necessary permissions
GRANT ALL ON turnos TO authenticated;
GRANT SELECT ON turnos TO anon;
GRANT ALL ON turnos TO service_role;

-- Grant usage on the sequence
GRANT USAGE, SELECT ON SEQUENCE turnos_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE turnos_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE turnos_id_seq TO service_role;