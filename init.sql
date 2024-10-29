CREATE DATABASE IF NOT EXISTS bd_voucher;

USE bd_voucher;

-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS perfis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  descricao TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de permissões
CREATE TABLE IF NOT EXISTS permissoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  descricao TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de relacionamento entre perfis e permissões
CREATE TABLE IF NOT EXISTS perfil_permissoes (
  perfil_id INT NOT NULL,
  permissao_id INT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (perfil_id, permissao_id),
  FOREIGN KEY (perfil_id) REFERENCES perfis(id),
  FOREIGN KEY (permissao_id) REFERENCES permissoes(id)
);

-- Tabela de empresas
CREATE TABLE IF NOT EXISTS empresas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) NOT NULL UNIQUE,
  logo LONGTEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de usuários com campos de segurança
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

-- Tabela de tipos de refeição
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

-- Tabela de uso de voucher com campos de auditoria
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

-- Tabela de vouchers extras com campos de auditoria
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

-- Tabela de imagens de fundo
CREATE TABLE IF NOT EXISTS imagens_fundo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pagina VARCHAR(50) NOT NULL,
  url_imagem TEXT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de vouchers descartáveis com campos de segurança
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

-- Tabela de log de ações do sistema
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

-- Tabela de sessões ativas
CREATE TABLE IF NOT EXISTS sessoes_ativas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  ip_acesso VARCHAR(45),
  dispositivo VARCHAR(255),
  data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_expiracao TIMESTAMP NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Inserir perfis padrão
INSERT INTO perfis (nome, descricao) VALUES
('admin', 'Administrador do sistema'),
('gestor', 'Gestor de empresa'),
('usuario', 'Usuário comum');

-- Inserir permissões básicas
INSERT INTO permissoes (nome, descricao) VALUES
('gerenciar_usuarios', 'Criar, editar e excluir usuários'),
('gerenciar_empresas', 'Criar, editar e excluir empresas'),
('gerenciar_refeicoes', 'Gerenciar tipos de refeição'),
('gerar_relatorios', 'Gerar e visualizar relatórios'),
('liberar_voucher', 'Liberar vouchers extras'),
('usar_voucher', 'Usar voucher para refeição');

-- Associar permissões aos perfis
INSERT INTO perfil_permissoes (perfil_id, permissao_id) 
SELECT p.id, pm.id 
FROM perfis p, permissoes pm 
WHERE p.nome = 'admin';

INSERT INTO perfil_permissoes (perfil_id, permissao_id)
SELECT p.id, pm.id 
FROM perfis p, permissoes pm 
WHERE p.nome = 'gestor' 
AND pm.nome IN ('gerenciar_usuarios', 'gerar_relatorios', 'liberar_voucher');

INSERT INTO perfil_permissoes (perfil_id, permissao_id)
SELECT p.id, pm.id 
FROM perfis p, permissoes pm 
WHERE p.nome = 'usuario' 
AND pm.nome = 'usar_voucher';

-- Inserir tipos de refeição padrão
INSERT INTO tipos_refeicao (nome, hora_inicio, hora_fim, valor) VALUES
('Café', '06:00:00', '08:00:00', 10.00),
('Almoço', '11:00:00', '14:00:00', 25.00),
('Lanche', '15:00:00', '16:00:00', 8.00),
('Jantar', '18:00:00', '20:00:00', 25.00),
('Ceia', '22:00:00', '23:00:00', 15.00),
('Extra', NULL, NULL, 25.00);