-- Create admin_users table
create table public.admin_users (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  email text not null unique,
  cpf text not null unique,
  empresa_id uuid references public.empresas(id),
  senha text not null,
  permissoes jsonb not null default '{
    "gerenciar_vouchers_extra": false,
    "gerenciar_vouchers_descartaveis": false,
    "gerenciar_usuarios": false,
    "gerenciar_relatorios": false
  }',
  criado_em timestamptz default now()
);

-- Enable RLS
alter table public.admin_users enable row level security;

-- Create policies
create policy "Admin users são visíveis para todos"
  on public.admin_users for select
  using (true);

create policy "Apenas admins podem inserir"
  on public.admin_users for insert
  with check (true);

create policy "Apenas admins podem atualizar"
  on public.admin_users for update
  using (true);

-- Create indexes
create index admin_users_empresa_id_idx on public.admin_users(empresa_id);
create index admin_users_email_idx on public.admin_users(email);
create index admin_users_cpf_idx on public.admin_users(cpf);