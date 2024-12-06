CREATE DATABASE sis_voucher;

\c sis_voucher;

SET timezone = 'America/Sao_Paulo';

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabelas principais
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
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
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
  usuario_id UUID REFERENCES usuarios(id),
  tipo_refeicao_id UUID REFERENCES tipos_refeicao(id),
  usado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vouchers_extras (
  id SERIAL PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id),
  tipo_refeicao_id UUID REFERENCES tipos_refeicao(id) NOT NULL,
  autorizado_por VARCHAR(255) NOT NULL,
  codigo VARCHAR(8) NOT NULL,
  valido_ate DATE NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  usado_em TIMESTAMP WITH TIME ZONE,
  observacao TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_uso_voucher_usuario_tipo ON uso_voucher(usuario_id, tipo_refeicao_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_extras_codigo ON vouchers_extras(codigo);
CREATE INDEX IF NOT EXISTS idx_uso_voucher_usuario_id ON uso_voucher(usuario_id);
CREATE INDEX IF NOT EXISTS idx_uso_voucher_tipo_refeicao_id ON uso_voucher(tipo_refeicao_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa_id ON usuarios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_turno_id ON usuarios(turno_id);

-- View para uso de voucher
DROP VIEW IF EXISTS vw_uso_voucher_detalhado;

CREATE VIEW vw_uso_voucher_detalhado AS
SELECT 
    uv.id,
    u.nome as nome_usuario,
    u.cpf,
    u.voucher,
    tr.nome as tipo_refeicao,
    tr.valor as valor_refeicao,
    e.nome as empresa,
    uv.usado_em,
    t.tipo_turno as turno
FROM uso_voucher uv
JOIN usuarios u ON uv.usuario_id = u.id
JOIN tipos_refeicao tr ON uv.tipo_refeicao_id = tr.id
JOIN empresas e ON u.empresa_id = e.id
LEFT JOIN turnos t ON u.turno_id = t.id
ORDER BY uv.usado_em DESC;

-- Permissões da view
GRANT SELECT ON vw_uso_voucher_detalhado TO authenticated;
GRANT SELECT ON vw_uso_voucher_detalhado TO anon;
GRANT SELECT ON vw_uso_voucher_detalhado TO service_role;

-- Dados iniciais
INSERT INTO turnos (tipo_turno, hora_inicio, hora_fim, ativo) VALUES
  ('central', '08:00:00', '17:00:00', true),
  ('primeiro', '06:00:00', '14:00:00', true),
  ('segundo', '14:00:00', '22:00:00', true),
  ('terceiro', '22:00:00', '06:00:00', true);

INSERT INTO tipos_refeicao (nome, valor, ativo, minutos_tolerancia) VALUES
  ('Refeição Extra', 15.00, true, 15);