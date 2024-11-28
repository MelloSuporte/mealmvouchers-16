-- Criar extensão uuid-ossp se ainda não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela vouchers_extras
CREATE TABLE IF NOT EXISTS vouchers_extras (
  id SERIAL PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id),
  tipo_refeicao_id UUID REFERENCES tipos_refeicao(id) NOT NULL,
  autorizado_por VARCHAR(255) NOT NULL,
  valido_ate DATE NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  usado_em TIMESTAMP WITH TIME ZONE,
  observacao TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_tipo_refeicao FOREIGN KEY (tipo_refeicao_id) REFERENCES tipos_refeicao(id) ON DELETE CASCADE
);

-- Adicionar índices para melhor performance
CREATE INDEX idx_vouchers_extras_usuario ON vouchers_extras(usuario_id);
CREATE INDEX idx_vouchers_extras_tipo_refeicao ON vouchers_extras(tipo_refeicao_id);
CREATE INDEX idx_vouchers_extras_valido_ate ON vouchers_extras(valido_ate);
CREATE INDEX idx_vouchers_extras_usado ON vouchers_extras(usado);

-- Adicionar comentários para documentação
COMMENT ON TABLE vouchers_extras IS 'Tabela para armazenar vouchers extras dos usuários';
COMMENT ON COLUMN vouchers_extras.id IS 'Identificador único do voucher extra';
COMMENT ON COLUMN vouchers_extras.usuario_id IS 'ID do usuário que recebeu o voucher extra';
COMMENT ON COLUMN vouchers_extras.tipo_refeicao_id IS 'ID do tipo de refeição associado ao voucher';
COMMENT ON COLUMN vouchers_extras.autorizado_por IS 'Nome ou identificação de quem autorizou o voucher extra';
COMMENT ON COLUMN vouchers_extras.valido_ate IS 'Data limite de validade do voucher extra';
COMMENT ON COLUMN vouchers_extras.usado IS 'Indica se o voucher já foi utilizado';
COMMENT ON COLUMN vouchers_extras.usado_em IS 'Data e hora em que o voucher foi utilizado';
COMMENT ON COLUMN vouchers_extras.observacao IS 'Observações adicionais sobre o voucher extra';
COMMENT ON COLUMN vouchers_extras.criado_em IS 'Data e hora de criação do registro';

-- Configurar permissões RLS
ALTER TABLE vouchers_extras ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Vouchers extras visíveis para todos os usuários autenticados"
ON vouchers_extras FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Apenas usuários autenticados podem criar vouchers extras"
ON vouchers_extras FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Apenas usuários autenticados podem atualizar vouchers extras"
ON vouchers_extras FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Garantir que a tabela está acessível para o role anon
GRANT SELECT, INSERT, UPDATE ON vouchers_extras TO anon;
GRANT USAGE ON SEQUENCE vouchers_extras_id_seq TO anon;