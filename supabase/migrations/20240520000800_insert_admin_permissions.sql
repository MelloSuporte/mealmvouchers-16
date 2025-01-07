-- Insert admin user with all permissions
INSERT INTO admin_users (
    email,
    nome,
    cpf,
    senha,
    permissoes
)
VALUES (
    'admin@mealmvouchers.com',
    'Administrador Master',
    '00000000000',
    '0001000',
    '{
        "gerenciar_vouchers_extra": true,
        "gerenciar_vouchers_descartaveis": true,
        "gerenciar_usuarios": true,
        "gerenciar_relatorios": true,
        "gerenciar_imagens_fundo": true,
        "gerenciar_gerentes": true,
        "gerenciar_turnos": true,
        "gerenciar_refeicoes_extras": true
    }'::jsonb
)
ON CONFLICT (email) 
DO UPDATE SET
    permissoes = EXCLUDED.permissoes,
    senha = EXCLUDED.senha,
    nome = EXCLUDED.nome,
    cpf = EXCLUDED.cpf;