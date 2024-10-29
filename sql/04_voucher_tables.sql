-- Tabelas relacionadas a vouchers
CREATE TABLE IF NOT EXISTS tipos_refeicao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  hora_inicio TIME,
  hora_fim TIME,
  valor DECIMAL(10,2) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  max_usuarios_por_dia INT,
  tolerancia_minutos INT DEFAULT 15,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS uso_voucher (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo_refeicao_id INT NOT NULL,
  ip_acesso VARCHAR(45),
  dispositivo VARCHAR(255),
  localidade VARCHAR(255),
  usado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (tipo_refeicao_id) REFERENCES tipos_refeicao(id)
);

CREATE TABLE IF NOT EXISTS vouchers_extras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  autorizado_por INT NOT NULL,
  motivo TEXT,
  valido_ate DATE,
  usado BOOLEAN DEFAULT FALSE,
  ip_criacao VARCHAR(45),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (autorizado_por) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS vouchers_descartaveis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(8) NOT NULL UNIQUE,
  usuario_id INT,
  tipo_refeicao_id INT,
  criado_por INT NOT NULL,
  ip_criacao VARCHAR(45),
  ip_uso VARCHAR(45),
  dispositivo_uso VARCHAR(255),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usado_em TIMESTAMP NULL,
  expira_em TIMESTAMP NULL,
  usado BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (tipo_refeicao_id) REFERENCES tipos_refeicao(id),
  FOREIGN KEY (criado_por) REFERENCES usuarios(id)
);