-- Primeiro, remova as políticas existentes
DROP POLICY IF EXISTS "Allow authenticated users to read turnos" ON turnos;
DROP POLICY IF EXISTS "Allow authenticated users to insert turnos" ON turnos;
DROP POLICY IF EXISTS "Allow authenticated users to update turnos" ON turnos;
DROP POLICY IF EXISTS "Allow authenticated users to delete turnos" ON turnos;

-- Recrie as políticas com permissões corretas
CREATE POLICY "Enable read access for all users"
ON turnos FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON turnos FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
ON turnos FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only"
ON turnos FOR DELETE
TO authenticated
USING (true);

-- Garanta que RLS está habilitado
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;

-- Garanta as permissões corretas
GRANT ALL ON turnos TO authenticated;
GRANT SELECT ON turnos TO anon;
GRANT ALL ON turnos TO service_role;

-- Garanta permissões na sequência
GRANT USAGE, SELECT ON SEQUENCE turnos_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE turnos_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE turnos_id_seq TO service_role;