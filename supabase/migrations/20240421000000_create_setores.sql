-- Create setores table if it doesn't exist
CREATE TABLE IF NOT EXISTS setores (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add setor_id to usuarios table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'usuarios' 
    AND column_name = 'setor_id'
  ) THEN
    ALTER TABLE usuarios 
    ADD COLUMN setor_id INTEGER REFERENCES setores(id);
  END IF;
END $$;

-- Create index if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE indexname = 'idx_usuarios_setor'
  ) THEN
    CREATE INDEX idx_usuarios_setor ON usuarios(setor_id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE setores ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Setores são visíveis para todos os usuários autenticados" ON setores;

-- Create RLS policies
CREATE POLICY "Setores são visíveis para todos os usuários autenticados"
  ON setores FOR SELECT
  TO authenticated
  USING (true);

-- Insert default sectors if they don't exist
INSERT INTO setores (nome)
SELECT nome
FROM (VALUES 
  ('Administrativo'),
  ('Produção'),
  ('Manutenção'),
  ('Logística'),
  ('Qualidade')
) AS new_sectors(nome)
WHERE NOT EXISTS (
  SELECT 1 FROM setores WHERE nome = new_sectors.nome
);