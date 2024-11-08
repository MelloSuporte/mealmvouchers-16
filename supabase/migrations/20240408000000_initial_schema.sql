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

-- Enable RLS
alter table public.empresas enable row level security;
alter table public.usuarios enable row level security;
alter table public.tipos_refeicao enable row level security;
alter table public.uso_voucher enable row level security;

-- Create basic policies
create policy "Empresas são visíveis para todos"
  on public.empresas for select
  using (true);

create policy "Usuários são visíveis para todos"
  on public.usuarios for select
  using (true);

-- Insert initial data
insert into public.empresas (nome, cnpj) values 
('Empresa Teste', '12345678000190'),
('Outra Empresa', '98765432000110');

insert into public.tipos_refeicao (nome, hora_inicio, hora_fim, valor) values 
('Café da Manhã', '06:00', '09:00', 10.00),
('Almoço', '11:00', '14:00', 25.00),
('Jantar', '18:00', '21:00', 25.00);