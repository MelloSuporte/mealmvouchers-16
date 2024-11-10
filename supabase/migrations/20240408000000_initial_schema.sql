-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create base tables
CREATE TABLE IF NOT EXISTS empresas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) NOT NULL UNIQUE,
  logo TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  empresa_id INTEGER REFERENCES empresas(id),
  voucher VARCHAR(4) NOT NULL,
  turno VARCHAR(10) CHECK (turno IN ('central', 'primeiro', 'segundo', 'terceiro')),
  suspenso BOOLEAN DEFAULT FALSE,
  foto TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tipos_refeicao (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  hora_inicio TIME,
  hora_fim TIME,
  valor DECIMAL(10,2) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  max_usuarios_por_dia INTEGER,
  minutos_tolerancia INTEGER DEFAULT 15,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS uso_voucher (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  tipo_refeicao_id INTEGER REFERENCES tipos_refeicao(id),
  usado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS configuracoes (
  id SERIAL PRIMARY KEY,
  chave VARCHAR(255) NOT NULL UNIQUE,
  valor TEXT,
  descricao TEXT,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logs_sistema (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL,
  mensagem TEXT NOT NULL,
  dados JSONB,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feriados (
  id SERIAL PRIMARY KEY,
  data DATE NOT NULL UNIQUE,
  descricao TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bloqueios_refeicao (
  id SERIAL PRIMARY KEY,
  tipo_refeicao_id INTEGER REFERENCES tipos_refeicao(id),
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  motivo TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create turnos table
CREATE TABLE IF NOT EXISTS turnos (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('central', 'primeiro', 'segundo', 'terceiro')),
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;

-- Create policies for turnos
CREATE POLICY "Turnos são visíveis para todos"
  ON turnos FOR SELECT
  USING (true);

CREATE POLICY "Apenas usuários autenticados podem inserir turnos"
  ON turnos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Apenas usuários autenticados podem atualizar turnos"
  ON turnos FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Insert initial data
INSERT INTO empresas (nome, cnpj) VALUES 
('Empresa Teste', '12.345.678/0001-90'),
('Outra Empresa', '98.765.432/0001-10');

INSERT INTO tipos_refeicao (nome, hora_inicio, hora_fim, valor) VALUES 
('Café da Manhã', '06:00:00', '09:00:00', 10.00),
('Almoço', '11:00:00', '14:00:00', 25.00),
('Jantar', '18:00:00', '21:00:00', 25.00);

INSERT INTO configuracoes (chave, valor, descricao) VALUES
('LOGO_SISTEMA', null, 'URL da logo do sistema'),
('IMAGEM_FUNDO', null, 'URL da imagem de fundo do sistema'),
('NOME_SISTEMA', 'Sistema de Vouchers', 'Nome do sistema');

-- Insert initial shifts
INSERT INTO turnos (tipo, hora_inicio, hora_fim, ativo) VALUES
('central', '08:00:00', '17:00:00', true),
('primeiro', '06:00:00', '14:00:00', true),
('segundo', '14:00:00', '22:00:00', true),
('terceiro', '22:00:00', '06:00:00', true);
