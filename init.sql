CREATE DATABASE IF NOT EXISTS bd_voucher;

USE bd_voucher;

CREATE TABLE IF NOT EXISTS companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) NOT NULL UNIQUE,
  logo LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  company_id INT,
  voucher VARCHAR(4) NOT NULL,
  turno ENUM('central', 'primeiro', 'segundo', 'terceiro') NOT NULL,
  is_suspended BOOLEAN DEFAULT FALSE,
  photo LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE IF NOT EXISTS meal_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  start_time TIME,
  end_time TIME,
  value DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS voucher_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  meal_type_id INT NOT NULL,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (meal_type_id) REFERENCES meal_types(id)
);

CREATE TABLE IF NOT EXISTS extra_vouchers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  authorized_by VARCHAR(255) NOT NULL,
  reason TEXT,
  valid_until DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS background_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page VARCHAR(50) NOT NULL,
  image_url TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir tipos de refeição padrão
INSERT INTO meal_types (name, start_time, end_time, value) VALUES
('Café', '06:00:00', '08:00:00', 10.00),
('Almoço', '11:00:00', '14:00:00', 25.00),
('Lanche', '15:00:00', '16:00:00', 8.00),
('Jantar', '18:00:00', '20:00:00', 25.00),
('Ceia', '22:00:00', '23:00:00', 15.00),
('Extra', NULL, NULL, 25.00);