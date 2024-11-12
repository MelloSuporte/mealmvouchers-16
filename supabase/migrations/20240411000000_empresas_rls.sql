-- Enable RLS on empresas table
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Create policies for empresas table
CREATE POLICY "Empresas são visíveis para todos"
  ON empresas FOR SELECT
  USING (true);

CREATE POLICY "Apenas usuários autenticados podem inserir empresas"
  ON empresas FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Apenas usuários autenticados podem atualizar empresas"
  ON empresas FOR UPDATE
  USING (auth.role() = 'authenticated');