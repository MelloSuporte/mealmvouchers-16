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

-- Create shift_configurations table
create table public.shift_configurations (
  id uuid primary key default uuid_generate_v4(),
  shift_type text not null check (shift_type in ('central', 'primeiro', 'segundo', 'terceiro')),
  start_time time not null,
  end_time time not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS for shift_configurations
alter table public.shift_configurations enable row level security;

-- Create policy for shift_configurations
create policy "Shift configurations are visible to all"
  on public.shift_configurations for select
  using (true);

create policy "Only authenticated users can insert shift configurations"
  on public.shift_configurations for insert
  with check (auth.role() = 'authenticated');

create policy "Only authenticated users can update shift configurations"
  on public.shift_configurations for update
  using (auth.role() = 'authenticated');

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
