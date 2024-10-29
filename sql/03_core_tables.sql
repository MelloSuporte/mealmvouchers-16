-- Tabelas principais
CREATE TABLE IF NOT EXISTS empresas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) NOT NULL UNIQUE,
  logo LONGTEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  empresa_id INT,
  perfil_id INT,
  voucher VARCHAR(4) NOT NULL,
  senha_hash VARCHAR(255),
  token_reset_senha VARCHAR(100),
  expiracao_token TIMESTAMP,
  turno ENUM('central', 'primeiro', 'segundo', 'terceiro') NOT NULL,
  suspenso BOOLEAN DEFAULT FALSE,
  foto LONGTEXT,
  ultimo_login TIMESTAMP,
  tentativas_login INT DEFAULT 0,
  bloqueado_ate TIMESTAMP,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id),
  FOREIGN KEY (perfil_id) REFERENCES perfis(id)
);