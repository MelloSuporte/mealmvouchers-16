-- Tabelas auxiliares
CREATE TABLE IF NOT EXISTS imagens_fundo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pagina VARCHAR(50) NOT NULL,
  url_imagem TEXT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS log_acoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  acao VARCHAR(255) NOT NULL,
  tabela_afetada VARCHAR(50),
  registro_afetado INT,
  dados_anteriores TEXT,
  dados_novos TEXT,
  ip_acesso VARCHAR(45),
  dispositivo VARCHAR(255),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);