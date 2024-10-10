CREATE DATABASE IF NOT EXISTS seu_banco_de_dados;

USE seu_banco_de_dados;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS meals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL
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

INSERT INTO users (name, email) VALUES
  ('João Silva', 'joao@example.com'),
  ('Maria Santos', 'maria@example.com');

INSERT INTO meals (name, description, start_time, end_time) VALUES
  ('Café da Manhã', 'Refeição matinal', '06:00:00', '09:00:00'),
  ('Almoço', 'Refeição do meio-dia', '11:00:00', '14:00:00'),
  ('Jantar', 'Refeição noturna', '18:00:00', '21:00:00');