CREATE DATABASE IF NOT EXISTS sis_voucher;

USE sis_voucher;

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

CREATE TABLE IF NOT EXISTS uso_voucher (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo_refeicao_id INT NOT NULL,
  usado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (tipo_refeicao_id) REFERENCES tipos_refeicao(id)
);

CREATE TABLE IF NOT EXISTS vouchers_extra (
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
  criado_por INT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usado_em TIMESTAMP NULL,
  expirado_em TIMESTAMP NULL,
  usado BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (tipo_refeicao_id) REFERENCES tipos_refeicao(id),
  FOREIGN KEY (criado_por) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS configuracoes_turno (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo_turno ENUM('central', 'primeiro', 'segundo', 'terceiro') NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO configuracoes_turno (tipo_turno, hora_inicio, hora_fim) VALUES
  ('central', '08:00:00', '17:00:00'),
  ('primeiro', '06:00:00', '14:00:00'),
  ('segundo', '14:00:00', '22:00:00'),
  ('terceiro', '22:00:00', '06:00:00');

CREATE TABLE IF NOT EXISTS usuarios_admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  empresa_id INT,
  senha VARCHAR(255) NOT NULL,
  master BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

CREATE TABLE IF NOT EXISTS permissoes_admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  gerenciar_vouchers_extra BOOLEAN DEFAULT FALSE,
  gerenciar_vouchers_descartaveis BOOLEAN DEFAULT FALSE,
  gerenciar_usuarios BOOLEAN DEFAULT FALSE,
  gerenciar_relatorios BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES usuarios_admin(id)
);

CREATE TABLE IF NOT EXISTS logs_admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  tipo_acao ENUM('criar', 'atualizar', 'excluir') NOT NULL,
  tipo_entidade VARCHAR(50) NOT NULL,
  entidade_id INT NOT NULL,
  detalhes JSON,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES usuarios_admin(id)
);