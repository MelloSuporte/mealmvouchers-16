CREATE DATABASE sis_voucher;

\c sis_voucher;

SET timezone = 'America/Sao_Paulo';

CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) NOT NULL UNIQUE,
  logo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  company_id INTEGER REFERENCES companies(id),
  voucher VARCHAR(4) NOT NULL,
  turno VARCHAR(10) CHECK (turno IN ('central', 'primeiro', 'segundo', 'terceiro')),
  is_suspended BOOLEAN DEFAULT FALSE,
  photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS meal_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  start_time TIME,
  end_time TIME,
  value DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  max_users_per_day INTEGER,
  tolerance_minutes INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS voucher_usage (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  meal_type_id INTEGER REFERENCES meal_types(id),
  used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS extra_vouchers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  authorized_by VARCHAR(255) NOT NULL,
  reason TEXT,
  valid_until DATE,
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
  user_id INTEGER REFERENCES users(id),
  meal_type_id INTEGER REFERENCES meal_types(id),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP WITH TIME ZONE,
  expired_at TIMESTAMP WITH TIME ZONE,
  is_used BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS shift_configurations (
  id SERIAL PRIMARY KEY,
  shift_type VARCHAR(10) CHECK (shift_type IN ('central', 'primeiro', 'segundo', 'terceiro')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default shift configurations
INSERT INTO shift_configurations (shift_type, start_time, end_time, is_active) VALUES
  ('central', '08:00:00', '17:00:00', true),
  ('primeiro', '06:00:00', '14:00:00', true),
  ('segundo', '14:00:00', '22:00:00', true),
  ('terceiro', '22:00:00', '06:00:00', true);

-- Enable RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Create policies for empresas table
CREATE POLICY "Empresas are viewable by everyone" 
ON empresas FOR SELECT 
USING (true);

CREATE POLICY "Empresas can be inserted by authenticated users only" 
ON empresas FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Empresas can be updated by authenticated users only" 
ON empresas FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Empresas can be deleted by authenticated users only" 
ON empresas FOR DELETE 
USING (auth.role() = 'authenticated');

-- Insert initial data
INSERT INTO empresas (nome, cnpj) VALUES 
('Empresa Teste', '12345678000190'),
('Outra Empresa', '98765432000110');

INSERT INTO meal_types (name, start_time, end_time, value) VALUES 
('Café da Manhã', '06:00:00', '09:00:00', 10.00),
('Almoço', '11:00:00', '14:00:00', 25.00),
('Jantar', '18:00:00', '21:00:00', 25.00);

INSERT INTO background_images (page, image_url) VALUES
('home', 'https://example.com/image1.png'),
('about', 'https://example.com/image2.png');
