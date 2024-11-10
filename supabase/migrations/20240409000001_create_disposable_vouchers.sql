-- Criar tabela vouchers_descartaveis
CREATE TABLE IF NOT EXISTS vouchers_descartaveis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(4) NOT NULL,
  tipo_refeicao_id UUID REFERENCES tipos_refeicao(id),
  data_expiracao TIMESTAMP WITH TIME ZONE NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  data_uso TIMESTAMP WITH TIME ZONE,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(codigo)
);

-- Habilitar RLS
ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;

-- Criar políticas
CREATE POLICY "Vouchers são visíveis para todos"
  ON vouchers_descartaveis FOR SELECT
  USING (true);

CREATE POLICY "Apenas usuários autenticados podem inserir vouchers"
  ON vouchers_descartaveis FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Apenas usuários autenticados podem atualizar vouchers"
  ON vouchers_descartaveis FOR UPDATE
  USING (auth.role() = 'authenticated');