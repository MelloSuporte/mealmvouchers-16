# Documentação do Banco de Dados

## Modelo de Dados

### Tabelas Principais

#### 1. empresas
```sql
CREATE TABLE empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. usuarios
```sql
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    empresa_id UUID REFERENCES empresas(id),
    turno_id UUID REFERENCES turnos(id),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. turnos
```sql
CREATE TABLE turnos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(50) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. tipos_refeicao
```sql
CREATE TABLE tipos_refeicao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(50) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    tolerancia_minutos INTEGER DEFAULT 0,
    limite_diario INTEGER,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. vouchers
```sql
CREATE TABLE vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(4) UNIQUE NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- 'comum', 'extra', 'descartavel'
    usuario_id UUID REFERENCES usuarios(id),
    data_validade DATE,
    observacao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. uso_voucher
```sql
CREATE TABLE uso_voucher (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voucher_id UUID REFERENCES vouchers(id),
    tipo_refeicao_id UUID REFERENCES tipos_refeicao(id),
    data_uso TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valor DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Relacionamentos

### Diagrama de Relacionamentos
```
empresas 1 ----* usuarios
usuarios 1 ----* vouchers
turnos 1 ----* usuarios
vouchers 1 ----* uso_voucher
tipos_refeicao 1 ----* uso_voucher
```

## Índices

```sql
-- usuarios
CREATE INDEX idx_usuarios_empresa ON usuarios(empresa_id);
CREATE INDEX idx_usuarios_turno ON usuarios(turno_id);
CREATE INDEX idx_usuarios_cpf ON usuarios(cpf);

-- vouchers
CREATE INDEX idx_vouchers_codigo ON vouchers(codigo);
CREATE INDEX idx_vouchers_usuario ON vouchers(usuario_id);
CREATE INDEX idx_vouchers_tipo ON vouchers(tipo);

-- uso_voucher
CREATE INDEX idx_uso_voucher_data ON uso_voucher(data_uso);
CREATE INDEX idx_uso_voucher_voucher ON uso_voucher(voucher_id);
```

## Queries Principais

### 1. Validação de Voucher
```sql
SELECT v.*, u.nome as usuario_nome, u.cpf, e.nome as empresa_nome
FROM vouchers v
LEFT JOIN usuarios u ON v.usuario_id = u.id
LEFT JOIN empresas e ON u.empresa_id = e.id
WHERE v.codigo = $1 AND v.ativo = true
AND (v.data_validade IS NULL OR v.data_validade >= CURRENT_DATE);
```

### 2. Histórico de Uso
```sql
SELECT uv.*, v.codigo, tr.nome as refeicao_nome, u.nome as usuario_nome
FROM uso_voucher uv
JOIN vouchers v ON uv.voucher_id = v.id
JOIN tipos_refeicao tr ON uv.tipo_refeicao_id = tr.id
LEFT JOIN usuarios u ON v.usuario_id = u.id
WHERE v.usuario_id = $1
ORDER BY uv.data_uso DESC;
```

### 3. Relatório de Uso por Empresa
```sql
SELECT 
    e.nome as empresa,
    COUNT(uv.id) as total_usos,
    SUM(uv.valor) as valor_total
FROM empresas e
JOIN usuarios u ON u.empresa_id = e.id
JOIN vouchers v ON v.usuario_id = u.id
JOIN uso_voucher uv ON uv.voucher_id = v.id
WHERE uv.data_uso BETWEEN $1 AND $2
GROUP BY e.id, e.nome;
```

## Políticas de Segurança

### Row Level Security (RLS)

```sql
-- Política para usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY usuarios_empresa_access ON usuarios
    FOR ALL
    TO authenticated
    USING (empresa_id IN (
        SELECT id FROM empresas 
        WHERE id = current_user_empresa_id()
    ));

-- Política para vouchers
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY vouchers_access ON vouchers
    FOR ALL
    TO authenticated
    USING (usuario_id IN (
        SELECT id FROM usuarios 
        WHERE empresa_id = current_user_empresa_id()
    ));
```

## Backup e Restauração

### Backup
```bash
# Backup completo
pg_dump -Fc mealmvouchers > backup_$(date +%Y%m%d).dump

# Backup apenas dos dados
pg_dump -Fc --data-only mealmvouchers > data_backup_$(date +%Y%m%d).dump
```

### Restauração
```bash
# Restauração completa
pg_restore -d mealmvouchers backup_20240101.dump

# Restauração apenas dos dados
pg_restore -d mealmvouchers --data-only data_backup_20240101.dump
```

## Manutenção

### 1. Limpeza de Dados
```sql
-- Remover registros antigos de uso
DELETE FROM uso_voucher 
WHERE data_uso < CURRENT_DATE - INTERVAL '1 year';

-- Desativar vouchers expirados
UPDATE vouchers 
SET ativo = false 
WHERE data_validade < CURRENT_DATE;
```

### 2. Análise de Performance
```sql
-- Verificar índices não utilizados
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;

-- Verificar tabelas que precisam de VACUUM
SELECT relname, n_dead_tup
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
```
