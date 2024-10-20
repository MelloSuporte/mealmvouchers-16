CREATE DATABASE IF NOT EXISTS seu_banco_de_dados;

USE seu_banco_de_dados;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  turno ENUM('primeiro', 'segundo', 'terceiro') NOT NULL,
  voucher_count INT DEFAULT 2,
  is_suspended BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS meals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  turno ENUM('primeiro', 'segundo', 'terceiro') NOT NULL
);

CREATE TABLE IF NOT EXISTS menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  meal_id INT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  FOREIGN KEY (meal_id) REFERENCES meals(id)
);

CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  meal_id INT,
  date DATE NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (meal_id) REFERENCES meals(id)
);

CREATE TABLE IF NOT EXISTS vouchers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(255) NOT NULL UNIQUE,
  user_id INT,
  meal_id INT,
  date DATE NOT NULL,
  status ENUM('unused', 'used', 'expired') DEFAULT 'unused',
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (meal_id) REFERENCES meals(id)
);

-- Inserir refeições para cada turno
INSERT INTO meals (name, description, start_time, end_time, turno) VALUES
  ('Café (1)', 'Primeiro café da manhã', '06:00:00', '08:00:00', 'primeiro'),
  ('Café (2)', 'Segundo café da manhã', '08:00:00', '10:00:00', 'primeiro'),
  ('Almoço', 'Refeição do meio-dia', '11:00:00', '14:00:00', 'primeiro'),
  ('Jantar', 'Refeição noturna', '18:00:00', '20:00:00', 'segundo'),
  ('Lanche', 'Lanche noturno', '20:00:00', '22:00:00', 'segundo'),
  ('Ceia', 'Refeição da madrugada', '00:00:00', '02:00:00', 'terceiro'),
  ('Desjejum', 'Café da manhã da madrugada', '04:00:00', '06:00:00', 'terceiro'),
  ('Extra', 'Refeição extra (sujeita a regras RLS)', '00:00:00', '23:59:59', 'primeiro');

-- Inserir usuários de exemplo para cada turno
INSERT INTO users (name, email, cpf, turno) VALUES
  ('João Silva', 'joao@example.com', '123.456.789-00', 'primeiro'),
  ('Maria Santos', 'maria@example.com', '987.654.321-00', 'segundo'),
  ('Pedro Oliveira', 'pedro@example.com', '111.222.333-44', 'terceiro');