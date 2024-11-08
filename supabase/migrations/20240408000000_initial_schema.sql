-- Enable RLS
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

-- Create tables
create table public.empresas (
  id bigint primary key generated always as identity,
  nome text not null,
  cnpj text not null unique,
  logo text,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.usuarios (
  id bigint primary key generated always as identity,
  nome text not null,
  email text not null unique,
  cpf text not null unique,
  empresa_id bigint references public.empresas,
  voucher text not null,
  turno text not null check (turno in ('central', 'primeiro', 'segundo', 'terceiro')),
  suspenso boolean default false,
  foto text,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.tipos_refeicao (
  id bigint primary key generated always as identity,
  nome text not null,
  hora_inicio time,
  hora_fim time,
  valor decimal(10,2) not null,
  ativo boolean default true,
  max_usuarios_por_dia integer,
  minutos_tolerancia integer default 15,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.uso_voucher (
  id bigint primary key generated always as identity,
  usuario_id bigint not null references public.usuarios,
  tipo_refeicao_id bigint not null references public.tipos_refeicao,
  usado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.vouchers_extra (
  id bigint primary key generated always as identity,
  usuario_id bigint not null references public.usuarios,
  autorizado_por text not null,
  motivo text,
  valido_ate date,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.imagens_fundo (
  id bigint primary key generated always as identity,
  pagina text not null,
  url_imagem text not null,
  ativo boolean default true,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.vouchers_descartaveis (
  id bigint primary key generated always as identity,
  codigo text not null unique,
  usuario_id bigint references public.usuarios,
  tipo_refeicao_id bigint references public.tipos_refeicao,
  criado_por bigint references public.usuarios,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null,
  usado_em timestamp with time zone,
  expirado_em timestamp with time zone,
  usado boolean default false
);

create table public.configuracoes_turno (
  id bigint primary key generated always as identity,
  tipo_turno text not null check (tipo_turno in ('central', 'primeiro', 'segundo', 'terceiro')),
  hora_inicio time not null,
  hora_fim time not null,
  ativo boolean default true,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null,
  atualizado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.usuarios_admin (
  id bigint primary key generated always as identity,
  nome text not null,
  email text not null unique,
  cpf text not null unique,
  empresa_id bigint references public.empresas,
  senha text not null,
  master boolean default false,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.permissoes_admin (
  id bigint primary key generated always as identity,
  admin_id bigint not null references public.usuarios_admin,
  gerenciar_vouchers_extra boolean default false,
  gerenciar_vouchers_descartaveis boolean default false,
  gerenciar_usuarios boolean default false,
  gerenciar_relatorios boolean default false,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.logs_admin (
  id bigint primary key generated always as identity,
  admin_id bigint not null references public.usuarios_admin,
  tipo_acao text not null check (tipo_acao in ('criar', 'atualizar', 'excluir')),
  tipo_entidade text not null,
  entidade_id bigint not null,
  detalhes jsonb,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert initial shift configurations
insert into public.configuracoes_turno (tipo_turno, hora_inicio, hora_fim) values
  ('central', '08:00:00', '17:00:00'),
  ('primeiro', '06:00:00', '14:00:00'),
  ('segundo', '14:00:00', '22:00:00'),
  ('terceiro', '22:00:00', '06:00:00');

-- Create RLS policies
create policy "Empresas são visíveis para todos os usuários autenticados"
  on public.empresas for select
  to authenticated
  using (true);

create policy "Usuários podem ver seus próprios dados"
  on public.usuarios for select
  to authenticated
  using (auth.uid()::text = id::text);

create policy "Admins podem gerenciar usuários"
  on public.usuarios for all
  to authenticated
  using (
    exists (
      select 1 from public.usuarios_admin
      where id = auth.uid()::bigint
      and (master = true or exists (
        select 1 from public.permissoes_admin
        where admin_id = auth.uid()::bigint
        and gerenciar_usuarios = true
      ))
    )
  );

-- Add more RLS policies as needed for other tables