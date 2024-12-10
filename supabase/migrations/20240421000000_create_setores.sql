-- Create setores table
CREATE TABLE IF NOT EXISTS setores (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add setor_id to usuarios table
ALTER TABLE usuarios 
ADD COLUMN setor_id INTEGER REFERENCES setores(id);

-- Create index
CREATE INDEX idx_usuarios_setor ON usuarios(setor_id);

-- Enable RLS
ALTER TABLE setores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Setores são visíveis para todos os usuários autenticados"
  ON setores FOR SELECT
  TO authenticated
  USING (true);

-- Insert some default sectors
INSERT INTO setores (nome) VALUES 
  ('Administrativo'),
  ('Produção'),
  ('Manutenção'),
  ('Logística'),
  ('Qualidade');