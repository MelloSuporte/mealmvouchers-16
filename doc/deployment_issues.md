# Guia de Problemas e Soluções no Deploy

## 1. Problemas de Build

### 1.1 Dependências Quebradas
**Problema**: Falha no build devido a incompatibilidade de dependências.

**Sintomas**:
```bash
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Soluções**:
1. Limpar cache do npm:
```bash
npm cache clean --force
rm -rf node_modules
rm package-lock.json
npm install
```

2. Verificar conflitos no package.json:
```json
{
  "resolutions": {
    "react": "^18.2.0",
    "@types/react": "^18.2.14"
  }
}
```

### 1.2 Variáveis de Ambiente
**Problema**: Build falha por variáveis de ambiente faltantes.

**Sintomas**:
```bash
Error: Missing environment variables
```

**Soluções**:
1. Verificar `.env`:
```bash
# Criar arquivo .env a partir do exemplo
cp .env.example .env

# Verificar variáveis necessárias
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=
```

2. Configurar no CI/CD:
```yaml
# .github/workflows/deploy.yml
env:
  VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## 2. Problemas de Runtime

### 2.1 Conexão com Supabase
**Problema**: Falha na conexão com Supabase em produção.

**Sintomas**:
```javascript
Error: Failed to connect to Supabase
NetworkError: Failed to fetch
```

**Soluções**:
1. Verificar configurações de CORS:
```sql
-- No Supabase
INSERT INTO auth.policies (name, definition)
VALUES ('allow_all', '{"origins": ["https://seu-dominio.com"]}');
```

2. Implementar retry mechanism:
```typescript
// services/supabase.ts
const supabaseClient = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
```

### 2.2 Problemas de Cache
**Problema**: Usuários vendo versões antigas da aplicação.

**Sintomas**:
- Interface desatualizada
- Comportamentos inconsistentes

**Soluções**:
1. Configurar headers de cache:
```nginx
# nginx.conf
location / {
    add_header Cache-Control "no-cache, must-revalidate";
    expires 0;
}

location /assets/ {
    expires 1y;
    add_header Cache-Control "public, no-transform";
}
```

2. Implementar versionamento de build:
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `[name].[hash].js`,
        chunkFileNames: `[name].[hash].js`,
        assetFileNames: `[name].[hash].[ext]`
      }
    }
  }
});
```

## 3. Problemas de Performance

### 3.1 Carregamento Lento
**Problema**: Aplicação lenta em produção.

**Sintomas**:
- Tempo de carregamento alto
- Métricas Web Vitals ruins

**Soluções**:
1. Implementar lazy loading:
```typescript
// routes/index.tsx
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Users = lazy(() => import('../pages/Users'));

export const routes = [
  {
    path: '/dashboard',
    element: (
      <Suspense fallback={<Loading />}>
        <Dashboard />
      </Suspense>
    )
  }
];
```

2. Otimizar bundle:
```javascript
// vite.config.js
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@shadcn/ui']
        }
      }
    }
  }
});
```

### 3.2 Memória
**Problema**: Vazamentos de memória em produção.

**Sintomas**:
- Uso crescente de memória
- Crashes após uso prolongado

**Soluções**:
1. Limpar event listeners:
```typescript
useEffect(() => {
  const subscription = subscribe();
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

2. Implementar monitoramento:
```typescript
// utils/monitoring.ts
export const memoryMonitor = {
  start: () => {
    setInterval(() => {
      const usage = window.performance.memory;
      if (usage.usedJSHeapSize > threshold) {
        logWarning('High memory usage detected');
      }
    }, 60000);
  }
};
```

## 4. Problemas de Segurança

### 4.1 Exposição de Dados Sensíveis
**Problema**: Dados sensíveis expostos em logs ou frontend.

**Sintomas**:
- Informações sensíveis em console
- Dados expostos no código-fonte

**Soluções**:
1. Sanitizar logs:
```typescript
// utils/logger.ts
const sanitizeData = (data: any) => {
  const sensitive = ['password', 'token', 'key'];
  return sensitive.reduce((acc, key) => {
    if (acc[key]) acc[key] = '***';
    return acc;
  }, {...data});
};
```

2. Configurar CSP:
```nginx
# nginx.conf
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://seu-supabase.com;
";
```

### 4.2 Rate Limiting
**Problema**: Abuso de API em produção.

**Sintomas**:
- Alto consumo de recursos
- Lentidão no serviço

**Soluções**:
1. Implementar rate limiting:
```typescript
// middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
});
```

2. Configurar no Nginx:
```nginx
# nginx.conf
limit_req_zone $binary_remote_addr zone=one:10m rate=1r/s;

location /api/ {
    limit_req zone=one burst=5;
}
```

## 5. Problemas de Banco de Dados

### 5.1 Migrações Falhas
**Problema**: Migrações não aplicadas corretamente.

**Sintomas**:
- Erros de schema
- Dados inconsistentes

**Soluções**:
1. Script de verificação:
```sql
-- verify_migrations.sql
CREATE OR REPLACE FUNCTION check_migrations()
RETURNS TABLE (
    migration_name text,
    status text
) AS $$
BEGIN
    RETURN QUERY
    SELECT m.name,
           CASE WHEN m.executed_at IS NULL 
                THEN 'pending'
                ELSE 'executed'
           END
    FROM migrations m
    ORDER BY m.created_at;
END;
$$ LANGUAGE plpgsql;
```

2. Implementar rollback:
```typescript
// scripts/migration.ts
async function runMigration(migration: Migration) {
  try {
    await db.transaction(async (trx) => {
      await trx.raw(migration.up);
      await trx('migrations').insert({
        name: migration.name,
        executed_at: new Date()
      });
    });
  } catch (error) {
    console.error(`Migration failed: ${migration.name}`);
    await db.raw(migration.down);
    throw error;
  }
}
```

### 5.2 Conexões Pendentes
**Problema**: Pool de conexões esgotado.

**Sintomas**:
- Timeouts
- Erros de conexão

**Soluções**:
1. Configurar pool:
```typescript
// config/database.ts
const pool = {
  min: 2,
  max: 10,
  acquireTimeoutMillis: 30000,
  createTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 100
};
```

2. Monitorar conexões:
```sql
-- monitor_connections.sql
SELECT 
  count(*) as total_connections,
  state,
  wait_event_type
FROM pg_stat_activity
GROUP BY state, wait_event_type;
```

## 6. Monitoramento e Recuperação

### 6.1 Implementar Logging
```typescript
// utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### 6.2 Sistema de Backup
```bash
#!/bin/bash
# backup.sh

# Backup do banco
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Backup de arquivos
tar -czf files_$(date +%Y%m%d).tar.gz ./uploads

# Upload para armazenamento seguro
aws s3 cp backup_$(date +%Y%m%d).sql s3://seu-bucket/
aws s3 cp files_$(date +%Y%m%d).tar.gz s3://seu-bucket/
```

### 6.3 Plano de Recuperação
1. Verificar logs
2. Restaurar último backup estável
3. Aplicar migrações pendentes
4. Verificar integridade dos dados
5. Reiniciar serviços
6. Monitorar métricas

## 7. Checklist de Deploy

### 7.1 Pré-Deploy
- [ ] Backup do banco de dados
- [ ] Verificar variáveis de ambiente
- [ ] Testar build local
- [ ] Verificar dependências
- [ ] Revisar configurações de segurança

### 7.2 Durante Deploy
- [ ] Monitorar logs
- [ ] Verificar migrações
- [ ] Testar funcionalidades críticas
- [ ] Verificar métricas de performance

### 7.3 Pós-Deploy
- [ ] Verificar SSL/TLS
- [ ] Testar autenticação
- [ ] Verificar integrações
- [ ] Monitorar erros
- [ ] Verificar backup automático
