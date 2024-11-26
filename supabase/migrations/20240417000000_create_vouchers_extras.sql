-- Criar tabela vouchers_extras se não existir
CREATE TABLE IF NOT EXISTS vouchers_extras (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  autorizado_por VARCHAR(255) NOT NULL,
  valido_ate DATE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS
ALTER TABLE vouchers_extras ENABLE ROW LEVEL SECURITY;

-- Criar políticas
CREATE POLICY "Vouchers extras são visíveis para todos"
  ON vouchers_extras FOR SELECT
  USING (true);

CREATE POLICY "Apenas usuários autenticados podem inserir vouchers extras"
  ON vouchers_extras FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');