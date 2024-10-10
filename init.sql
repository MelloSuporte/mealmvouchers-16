CREATE DATABASE IF NOT EXISTS seu_banco_de_dados;

USE seu_banco_de_dados;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE
);

INSERT INTO users (name, email) VALUES
  ('João Silva', 'joao@example.com'),
  ('Maria Santos', 'maria@example.com');