CREATE DATABASE sis_voucher;

\c sis_voucher;

SET timezone = 'America/Sao_Paulo';

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS empresas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) NOT NULL UNIQUE,
  logo TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS turnos (
  id SERIAL PRIMARY KEY,
  tipo_turno VARCHAR(10) CHECK (tipo_turno IN ('central', 'primeiro', 'segundo', 'terceiro')),
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  empresa_id INTEGER REFERENCES empresas(id),
  voucher VARCHAR(4) NOT NULL,
  turno_id INTEGER REFERENCES turnos(id),
  suspenso BOOLEAN DEFAULT FALSE,
  foto TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tipos_refeicao (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  horario_inicio TIME,
  horario_fim TIME,
  valor DECIMAL(10,2) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  max_usuarios_por_dia INTEGER,
  minutos_tolerancia INTEGER DEFAULT 15,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS uso_voucher (
  id SERIAL PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id),
  tipo_refeicao_id UUID REFERENCES tipos_refeicao(id),
  usado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vouchers_extras (
  id SERIAL PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id),
  tipo_refeicao_id UUID REFERENCES tipos_refeicao(id) NOT NULL,
  autorizado_por VARCHAR(255) NOT NULL,
  codigo VARCHAR(8) NOT NULL UNIQUE,
  valido_ate DATE NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  usado_em TIMESTAMP WITH TIME ZONE,
  observacao TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configurações padrão de turnos
INSERT INTO turnos (tipo_turno, horario_inicio, horario_fim, ativo) VALUES
  ('central', '08:00:00', '17:00:00', true),
  ('primeiro', '06:00:00', '14:00:00', true),
  ('segundo', '14:00:00', '22:00:00', true),
  ('terceiro', '22:00:00', '06:00:00', true);

-- Inserir tipo de refeição extra padrão
INSERT INTO tipos_refeicao (nome, valor, ativo, minutos_tolerancia) VALUES
  ('Refeição Extra', 15.00, true, 15);