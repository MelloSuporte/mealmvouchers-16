-- Habilita extensão UUID
create extension if not exists "uuid-ossp";

-- Tabela empresas
create table public.empresas (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  cnpj text not null unique,
  logo text,
  criado_em timestamptz default now()
);

-- Tabela usuarios
create table public.usuarios (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  email text not null unique,
  cpf text not null unique,
  empresa_id uuid references public.empresas,
  voucher text not null,
  turno text not null check (turno in ('central', 'primeiro', 'segundo', 'terceiro')),
  suspenso boolean default false,
  foto text,
  criado_em timestamptz default now()
);

-- Tabela tipos_refeicao
create table public.tipos_refeicao (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  hora_inicio time,
  hora_fim time,
  valor decimal(10,2) not null,
  ativo boolean default true,
  max_usuarios_por_dia integer,
  minutos_tolerancia integer default 15,
  criado_em timestamptz default now()
);

-- Tabela uso_voucher
create table public.uso_voucher (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid not null references public.usuarios,
  tipo_refeicao_id uuid not null references public.tipos_refeicao,
  usado_em timestamptz default now()
);

-- Tabela vouchers_extra
create table public.vouchers_extra (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid not null references public.usuarios,
  autorizado_por text not null,
  motivo text,
  valido_ate date,
  criado_em timestamptz default now()
);

-- Tabela imagens_fundo
create table public.imagens_fundo (
  id uuid primary key default uuid_generate_v4(),
  pagina text not null,
  url_imagem text not null,
  ativo boolean default true,
  criado_em timestamptz default now()
);

-- Tabela vouchers_descartaveis
create table public.vouchers_descartaveis (
  id uuid primary key default uuid_generate_v4(),
  codigo text not null unique,
  usuario_id uuid references public.usuarios,
  tipo_refeicao_id uuid references public.tipos_refeicao,
  criado_por uuid references public.usuarios,
  criado_em timestamptz default now(),
  usado_em timestamptz,
  expirado_em timestamptz,
  usado boolean default false
);

-- Tabela configuracoes_turno
create table public.configuracoes_turno (
  id uuid primary key default uuid_generate_v4(),
  tipo_turno text not null check (tipo_turno in ('central', 'primeiro', 'segundo', 'terceiro')),
  hora_inicio time not null,
  hora_fim time not null,
  ativo boolean default true,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- Tabela usuarios_admin
create table public.usuarios_admin (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  email text not null unique,
  cpf text not null unique,
  empresa_id uuid references public.empresas,
  senha text not null,
  master boolean default false,
  criado_em timestamptz default now()
);

-- Tabela permissoes_admin
create table public.permissoes_admin (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid not null references public.usuarios_admin,
  gerenciar_vouchers_extra boolean default false,
  gerenciar_vouchers_descartaveis boolean default false,
  gerenciar_usuarios boolean default false,
  gerenciar_relatorios boolean default false,
  criado_em timestamptz default now()
);

-- Tabela logs_admin
create table public.logs_admin (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid not null references public.usuarios_admin,
  tipo_acao text not null check (tipo_acao in ('criar', 'atualizar', 'excluir')),
  tipo_entidade text not null,
  entidade_id uuid not null,
  detalhes jsonb,
  criado_em timestamptz default now()
);

-- Inserir configurações iniciais de turno
insert into public.configuracoes_turno (tipo_turno, hora_inicio, hora_fim) values
  ('central', '08:00', '17:00'),
  ('primeiro', '06:00', '14:00'),
  ('segundo', '14:00', '22:00'),
  ('terceiro', '22:00', '06:00');

-- Habilitar Row Level Security (RLS)
alter table public.empresas enable row level security;
alter table public.usuarios enable row level security;
alter table public.tipos_refeicao enable row level security;
alter table public.uso_voucher enable row level security;
alter table public.vouchers_extra enable row level security;
alter table public.imagens_fundo enable row level security;
alter table public.vouchers_descartaveis enable row level security;
alter table public.configuracoes_turno enable row level security;
alter table public.usuarios_admin enable row level security;
alter table public.permissoes_admin enable row level security;
alter table public.logs_admin enable row level security;

-- Criar políticas básicas
create policy "Empresas são visíveis para todos os usuários autenticados"
  on public.empresas for select
  to authenticated
  using (true);

create policy "Usuários podem ver seus próprios dados"
  on public.usuarios for select
  to authenticated
  using (auth.uid() = id::text);