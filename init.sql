CREATE DATABASE IF NOT EXISTS sis_voucher;

USE sis_voucher;

-- Create tables
CREATE TABLE IF NOT EXISTS empresas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) NOT NULL UNIQUE,
  logo LONGTEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  empresa_id INT,
  voucher VARCHAR(4) NOT NULL,
  turno ENUM('central', 'primeiro', 'segundo', 'terceiro') NOT NULL,
  suspenso BOOLEAN DEFAULT FALSE,
  foto LONGTEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE TABLE IF NOT EXISTS tipos_refeicao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  hora_inicio TIME,
  hora_fim TIME,
  valor DECIMAL(10,2) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  max_usuarios_por_dia INT,
  minutos_tolerancia INT DEFAULT 15,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some initial data
INSERT INTO empresas (nome, cnpj) VALUES 
('Empresa Teste', '12.345.678/0001-90'),
('Outra Empresa', '98.765.432/0001-10');

INSERT INTO tipos_refeicao (nome, hora_inicio, hora_fim, valor) VALUES 
('Café da Manhã', '06:00:00', '09:00:00', 10.00),
('Almoço', '11:00:00', '14:00:00', 25.00),
('Jantar', '18:00:00', '21:00:00', 25.00);