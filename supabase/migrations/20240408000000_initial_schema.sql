-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create base tables
create table public.empresas (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  cnpj text not null unique,
  logo text,
  criado_em timestamptz default now()
);

create table public.usuarios (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  email text not null unique,
  cpf text not null unique,
  empresa_id uuid references public.empresas,
  voucher text not null,
  turno text check (turno in ('central', 'primeiro', 'segundo', 'terceiro')),
  suspenso boolean default false,
  foto text,
  criado_em timestamptz default now()
);

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

create table public.uso_voucher (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid references public.usuarios,
  tipo_refeicao_id uuid references public.tipos_refeicao,
  usado_em timestamptz default now()
);

create table public.configuracoes (
  id uuid primary key default uuid_generate_v4(),
  chave text not null unique,
  valor text,
  descricao text,
  atualizado_em timestamptz default now()
);

create table public.logs_sistema (
  id uuid primary key default uuid_generate_v4(),
  tipo text not null,
  mensagem text not null,
  dados jsonb,
  criado_em timestamptz default now()
);

create table public.feriados (
  id uuid primary key default uuid_generate_v4(),
  data date not null unique,
  descricao text,
  criado_em timestamptz default now()
);

create table public.bloqueios_refeicao (
  id uuid primary key default uuid_generate_v4(),
  tipo_refeicao_id uuid references public.tipos_refeicao,
  data_inicio date not null,
  data_fim date not null,
  motivo text,
  criado_em timestamptz default now()
);

-- Enable RLS
alter table public.empresas enable row level security;
alter table public.usuarios enable row level security;
alter table public.tipos_refeicao enable row level security;
alter table public.uso_voucher enable row level security;
alter table public.configuracoes enable row level security;
alter table public.logs_sistema enable row level security;
alter table public.feriados enable row level security;
alter table public.bloqueios_refeicao enable row level security;

-- Create basic policies
create policy "Empresas são visíveis para todos"
  on public.empresas for select
  using (true);

create policy "Usuários são visíveis para todos"
  on public.usuarios for select
  using (true);

create policy "Tipos de refeição são visíveis para todos"
  on public.tipos_refeicao for select
  using (true);

create policy "Configurações são visíveis para todos"
  on public.configuracoes for select
  using (true);

create policy "Feriados são visíveis para todos"
  on public.feriados for select
  using (true);

-- Insert initial data
insert into public.empresas (nome, cnpj) values 
('Empresa Teste', '12345678000190'),
('Outra Empresa', '98765432000110');

insert into public.tipos_refeicao (nome, hora_inicio, hora_fim, valor) values 
('Café da Manhã', '06:00', '09:00', 10.00),
('Almoço', '11:00', '14:00', 25.00),
('Jantar', '18:00', '21:00', 25.00);

insert into public.configuracoes (chave, valor, descricao) values
('LOGO_SISTEMA', null, 'URL da logo do sistema'),
('IMAGEM_FUNDO', null, 'URL da imagem de fundo do sistema'),
('NOME_SISTEMA', 'Sistema de Vouchers', 'Nome do sistema');