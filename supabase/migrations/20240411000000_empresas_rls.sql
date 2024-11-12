-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Empresas são visíveis para todos" ON empresas;
DROP POLICY IF EXISTS "Apenas usuários autenticados podem inserir empresas" ON empresas;
DROP POLICY IF EXISTS "Apenas usuários autenticados podem atualizar empresas" ON empresas;

-- Enable RLS on empresas table
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Create policies for empresas table
CREATE POLICY "Enable read access for all users"
  ON empresas FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users only"
  ON empresas FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only"
  ON empresas FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only"
  ON empresas FOR DELETE
  USING (auth.role() = 'authenticated');