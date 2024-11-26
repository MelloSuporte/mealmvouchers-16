-- Criar extensão uuid-ossp se ainda não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela vouchers_extras se não existir
CREATE TABLE IF NOT EXISTS vouchers_extras (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id uuid REFERENCES usuarios(id),
  autorizado_por VARCHAR(255) NOT NULL,
  valido_ate DATE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  usado BOOLEAN DEFAULT FALSE,
  usado_em TIMESTAMP WITH TIME ZONE,
  observacao TEXT
);

-- Comentários na tabela e colunas
COMMENT ON TABLE vouchers_extras IS 'Tabela para gerenciar vouchers extras dos usuários';
COMMENT ON COLUMN vouchers_extras.id IS 'Identificador único do voucher extra';
COMMENT ON COLUMN vouchers_extras.usuario_id IS 'ID do usuário que recebeu o voucher extra';
COMMENT ON COLUMN vouchers_extras.autorizado_por IS 'Nome ou identificação de quem autorizou o voucher extra';
COMMENT ON COLUMN vouchers_extras.valido_ate IS 'Data limite de validade do voucher extra';
COMMENT ON COLUMN vouchers_extras.criado_em IS 'Data e hora de criação do registro';
COMMENT ON COLUMN vouchers_extras.usado IS 'Indica se o voucher já foi utilizado';
COMMENT ON COLUMN vouchers_extras.usado_em IS 'Data e hora em que o voucher foi utilizado';
COMMENT ON COLUMN vouchers_extras.observacao IS 'Observações adicionais sobre o voucher extra';

-- Habilitar RLS
ALTER TABLE vouchers_extras ENABLE ROW LEVEL SECURITY;

-- Criar políticas
CREATE POLICY "Vouchers extras são visíveis para todos"
  ON vouchers_extras FOR SELECT
  USING (true);

CREATE POLICY "Apenas usuários autenticados podem inserir vouchers extras"
  ON vouchers_extras FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Criar índices
CREATE INDEX idx_vouchers_extras_usuario_id ON vouchers_extras(usuario_id);
CREATE INDEX idx_vouchers_extras_valido_ate ON vouchers_extras(valido_ate);
CREATE INDEX idx_vouchers_extras_usado ON vouchers_extras(usado);

-- Inserir dados de exemplo
INSERT INTO vouchers_extras (usuario_id, autorizado_por, valido_ate, observacao)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Sistema', CURRENT_DATE + INTERVAL '30 days', 'Voucher extra concedido por bom desempenho'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Sistema', CURRENT_DATE + INTERVAL '15 days', 'Voucher extra por hora extra'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Sistema', CURRENT_DATE + INTERVAL '7 days', 'Voucher compensação'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Sistema', CURRENT_DATE + INTERVAL '30 days', 'Voucher extra evento especial'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Sistema', CURRENT_DATE + INTERVAL '60 days', 'Voucher premiação');