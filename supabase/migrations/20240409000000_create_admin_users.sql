-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  empresa_id INTEGER REFERENCES empresas(id),
  senha TEXT NOT NULL,
  permissoes JSONB NOT NULL DEFAULT '{
    "gerenciar_vouchers_extra": false,
    "gerenciar_vouchers_descartaveis": false,
    "gerenciar_usuarios": false,
    "gerenciar_relatorios": false
  }',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin users são visíveis para todos"
  ON admin_users FOR SELECT
  USING (true);

CREATE POLICY "Apenas admins podem inserir"
  ON admin_users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Apenas admins podem atualizar"
  ON admin_users FOR UPDATE
  USING (true);

-- Create indexes
CREATE INDEX admin_users_empresa_id_idx ON admin_users(empresa_id);
CREATE INDEX admin_users_email_idx ON admin_users(email);
CREATE INDEX admin_users_cpf_idx ON admin_users(cpf);