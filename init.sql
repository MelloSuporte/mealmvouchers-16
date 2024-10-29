CREATE DATABASE IF NOT EXISTS bd_voucher;

USE bd_voucher;

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
  tolerancia_minutos INT DEFAULT 15,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS uso_voucher (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo_refeicao_id INT NOT NULL,
  usado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (tipo_refeicao_id) REFERENCES tipos_refeicao(id)
);

CREATE TABLE IF NOT EXISTS vouchers_extras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  autorizado_por VARCHAR(255) NOT NULL,
  motivo TEXT,
  valido_ate DATE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS imagens_fundo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pagina VARCHAR(50) NOT NULL,
  url_imagem TEXT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vouchers_descartaveis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(8) NOT NULL UNIQUE,
  usuario_id INT,
  tipo_refeicao_id INT,
  criado_por INT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usado_em TIMESTAMP NULL,
  expira_em TIMESTAMP NULL,
  usado BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (tipo_refeicao_id) REFERENCES tipos_refeicao(id),
  FOREIGN KEY (criado_por) REFERENCES usuarios(id)
);

-- Inserir tipos de refeição padrão
INSERT INTO tipos_refeicao (nome, hora_inicio, hora_fim, valor) VALUES
('Café', '06:00:00', '08:00:00', 10.00),
('Almoço', '11:00:00', '14:00:00', 25.00),
('Lanche', '15:00:00', '16:00:00', 8.00),
('Jantar', '18:00:00', '20:00:00', 25.00),
('Ceia', '22:00:00', '23:00:00', 15.00),
('Extra', NULL, NULL, 25.00);