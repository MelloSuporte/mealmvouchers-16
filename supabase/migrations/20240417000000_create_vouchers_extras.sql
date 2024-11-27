-- Criar extensão uuid-ossp se ainda não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela vouchers_extras se não existir
CREATE TABLE IF NOT EXISTS vouchers_extras (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id uuid REFERENCES usuarios(id),
  tipo_refeicao_id INTEGER REFERENCES tipos_refeicao(id) NOT NULL,
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
COMMENT ON COLUMN vouchers_extras.tipo_refeicao_id IS 'ID do tipo de refeição associado ao voucher';
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
CREATE INDEX idx_vouchers_extras_tipo_refeicao_id ON vouchers_extras(tipo_refeicao_id);
CREATE INDEX idx_vouchers_extras_valido_ate ON vouchers_extras(valido_ate);
CREATE INDEX idx_vouchers_extras_usado ON vouchers_extras(usado);