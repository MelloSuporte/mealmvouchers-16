-- Dados iniciais
INSERT INTO perfis (nome, descricao) VALUES
('admin', 'Administrador do sistema'),
('gestor', 'Gestor de empresa'),
('usuario', 'Usuário comum');

INSERT INTO permissoes (nome, descricao) VALUES
('gerenciar_usuarios', 'Criar, editar e excluir usuários'),
('gerenciar_empresas', 'Criar, editar e excluir empresas'),
('gerenciar_refeicoes', 'Gerenciar tipos de refeição'),
('gerar_relatorios', 'Gerar e visualizar relatórios'),
('liberar_voucher', 'Liberar vouchers extras'),
('usar_voucher', 'Usar voucher para refeição');

-- Associar todas permissões ao admin
INSERT INTO perfil_permissoes (perfil_id, permissao_id) 
SELECT p.id, pm.id 
FROM perfis p, permissoes pm 
WHERE p.nome = 'admin';

-- Associar permissões específicas ao gestor
INSERT INTO perfil_permissoes (perfil_id, permissao_id)
SELECT p.id, pm.id 
FROM perfis p, permissoes pm 
WHERE p.nome = 'gestor' 
AND pm.nome IN ('gerenciar_usuarios', 'gerar_relatorios', 'liberar_voucher');

-- Associar permissão básica ao usuário
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