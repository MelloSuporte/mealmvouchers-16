CREATE DATABASE sis_voucher;

\c sis_voucher;

SET timezone = 'America/Sao_Paulo';

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

CREATE TABLE IF NOT EXISTS turnos (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('central', 'primeiro', 'segundo', 'terceiro')),
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bloqueios_refeicao (
  id SERIAL PRIMARY KEY,
  tipo_refeicao_id INTEGER REFERENCES tipos_refeicao(id),
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  motivo TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial data
INSERT INTO empresas (nome, cnpj) VALUES 
('Empresa Teste', '12.345.678/0001-90'),
('Outra Empresa', '98.765.432/0001-10');

INSERT INTO tipos_refeicao (nome, hora_inicio, hora_fim, valor) VALUES 
('Café da Manhã', '06:00:00', '09:00:00', 10.00),
('Almoço', '11:00:00', '14:00:00', 25.00),
('Jantar', '18:00:00', '21:00:00', 25.00);

-- Insert initial shifts
INSERT INTO turnos (tipo, hora_inicio, hora_fim, ativo) VALUES
('central', '08:00:00', '17:00:00', true),
('primeiro', '06:00:00', '14:00:00', true),
('segundo', '14:00:00', '22:00:00', true),
('terceiro', '22:00:00', '06:00:00', true);

-- Set timezone for the session
SET timezone TO 'America/Sao_Paulo';
