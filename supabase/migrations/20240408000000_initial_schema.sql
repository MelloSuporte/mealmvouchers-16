CREATE DATABASE IF NOT EXISTS sis_voucher;

-- Connect to the database
\c sis_voucher;

-- Set timezone
SET timezone = 'America/Sao_Paulo';

-- Create companies table in public schema
CREATE TABLE IF NOT EXISTS public.companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) NOT NULL UNIQUE,
  logo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create turnos table in public schema with correct column names
CREATE TABLE IF NOT EXISTS public.turnos (
  id SERIAL PRIMARY KEY,
  tipo_turno VARCHAR(10) CHECK (tipo_turno IN ('central', 'primeiro', 'segundo', 'terceiro')),
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

-- Insert default turnos
INSERT INTO public.turnos (tipo_turno, horario_inicio, horario_fim, ativo) VALUES
  ('central', '08:00:00', '17:00:00', true),
  ('primeiro', '06:00:00', '14:00:00', true),
  ('segundo', '14:00:00', '22:00:00', true),
  ('terceiro', '22:00:00', '06:00:00', true);
