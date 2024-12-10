-- Create Database
CREATE DATABASE IF NOT EXISTS sis_voucher;

\c sis_voucher;

-- Set timezone
SET timezone = 'America/Sao_Paulo';

-- Create Tables
CREATE TABLE IF NOT EXISTS empresas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    logo TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    empresa_id INTEGER REFERENCES empresas(id),
    voucher VARCHAR(4) NOT NULL,
    turno VARCHAR(10) CHECK (turno IN ('central', 'primeiro', 'segundo', 'terceiro')),
    suspenso BOOLEAN DEFAULT FALSE,
    foto TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS turnos (
    id SERIAL PRIMARY KEY,
    tipo_turno VARCHAR(10) CHECK (tipo_turno IN ('central', 'primeiro', 'segundo', 'terceiro')),
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS setores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS uso_voucher (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    tipo_refeicao_id INTEGER REFERENCES tipos_refeicao(id),
    usado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vouchers_extras (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    autorizado_por VARCHAR(255) NOT NULL,
    valido_ate DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS background_images (
    id SERIAL PRIMARY KEY,
    page VARCHAR(50) NOT NULL,
    image_url TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS disposable_vouchers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(8) NOT NULL UNIQUE,
    user_id INTEGER REFERENCES usuarios(id),
    meal_type_id INTEGER REFERENCES tipos_refeicao(id),
    created_by INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP WITH TIME ZONE,
    expired_at TIMESTAMP WITH TIME ZONE,
    is_used BOOLEAN DEFAULT FALSE
);

-- Insert default shift configurations
INSERT INTO turnos (tipo_turno, horario_inicio, horario_fim, ativo) VALUES
    ('central', '08:00:00', '17:00:00', true),
    ('primeiro', '06:00:00', '14:00:00', true),
    ('segundo', '14:00:00', '22:00:00', true),
    ('terceiro', '22:00:00', '06:00:00', true);

-- Create indexes for better performance
CREATE INDEX idx_usuarios_empresa ON usuarios(empresa_id);
CREATE INDEX idx_usuarios_cpf ON usuarios(cpf);
CREATE INDEX idx_vouchers_extras_usuario ON vouchers_extras(usuario_id);
CREATE INDEX idx_uso_voucher_usuario ON uso_voucher(usuario_id);
CREATE INDEX idx_uso_voucher_tipo_refeicao ON uso_voucher(tipo_refeicao_id);
CREATE INDEX idx_disposable_vouchers_code ON disposable_vouchers(code);
CREATE INDEX idx_disposable_vouchers_user ON disposable_vouchers(user_id);
CREATE INDEX idx_disposable_vouchers_meal_type ON disposable_vouchers(meal_type_id);