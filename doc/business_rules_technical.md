# Detalhes Técnicos das Regras de Negócio

## 1. Geração de Vouchers

### 1.1 Algoritmo de Geração de Voucher Comum
```typescript
interface VoucherGenerationParams {
  cpf: string;
  timestamp: number;
}

function generateVoucherCode(params: VoucherGenerationParams): string {
  // Extrai dígitos do CPF (posições 2-11)
  const cpfDigits = params.cpf.substring(1, 11);
  
  // Soma dos dígitos
  const sum = cpfDigits.split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  
  // Timestamp em segundos
  const timeComponent = Math.floor(params.timestamp / 1000) % 10000;
  
  // Combina os componentes
  const baseNumber = (sum * timeComponent) % 10000;
  
  // Formata para 4 dígitos
  return baseNumber.toString().padStart(4, '0');
}
```

### 1.2 Validação de Unicidade
```sql
-- Função para verificar unicidade do voucher
CREATE OR REPLACE FUNCTION check_voucher_unique(p_codigo VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM vouchers 
    WHERE codigo = p_codigo 
    AND ativo = true
  );
END;
$$ LANGUAGE plpgsql;
```

## 2. Controle de Acesso e Horários

### 2.1 Validação de Horário de Refeição
```typescript
interface TimeValidationParams {
  currentTime: Date;
  mealType: string;
  shiftId: string;
  tolerance: number;
}

function isValidMealTime(params: TimeValidationParams): boolean {
  const { currentTime, mealType, shiftId, tolerance } = params;
  
  // Obtém configurações do turno
  const shift = getShiftConfig(shiftId);
  
  // Obtém horários da refeição
  const mealTimes = getMealTimes(mealType);
  
  // Aplica tolerância
  const startTime = addMinutes(mealTimes.start, -tolerance);
  const endTime = addMinutes(mealTimes.end, tolerance);
  
  return isWithinInterval(currentTime, { start: startTime, end: endTime });
}
```

### 2.2 Controle de Intervalo Entre Refeições
```sql
CREATE OR REPLACE FUNCTION check_meal_interval(
  p_usuario_id UUID,
  p_tipo_refeicao_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_last_meal TIMESTAMP;
  v_min_interval INTERVAL := '3 hours';
BEGIN
  -- Obtém última refeição do usuário
  SELECT MAX(data_uso) INTO v_last_meal
  FROM uso_voucher uv
  JOIN vouchers v ON v.id = uv.voucher_id
  WHERE v.usuario_id = p_usuario_id;
  
  -- Verifica intervalo
  RETURN v_last_meal IS NULL OR 
         CURRENT_TIMESTAMP - v_last_meal >= v_min_interval;
END;
$$ LANGUAGE plpgsql;
```

## 3. Permissões e Autorização

### 3.1 Middleware de Verificação de Permissões
```typescript
interface PermissionCheck {
  userId: string;
  action: string;
  resource: string;
}

const permissionMiddleware = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const { userId, action, resource } = req.permission as PermissionCheck;
  
  try {
    const hasPermission = await checkUserPermission({
      userId,
      action,
      resource
    });
    
    if (!hasPermission) {
      return res.status(403).json({
        error: 'Não autorizado para esta operação'
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
```

### 3.2 Políticas de Banco de Dados
```sql
-- RLS para vouchers
CREATE POLICY voucher_access_policy ON vouchers
USING (
  CASE 
    WHEN current_user_role() = 'admin' THEN true
    WHEN current_user_role() = 'gestor' THEN 
      usuario_id IN (
        SELECT id FROM usuarios 
        WHERE empresa_id = current_user_empresa()
      )
    ELSE usuario_id = current_user_id()
  END
);
```

## 4. Validação de Vouchers

### 4.1 Processo de Validação Completo
```typescript
interface VoucherValidation {
  code: string;
  mealType: string;
  timestamp: Date;
}

async function validateVoucher(params: VoucherValidation): Promise<ValidationResult> {
  const { code, mealType, timestamp } = params;
  
  // 1. Verifica existência e status do voucher
  const voucher = await findActiveVoucher(code);
  if (!voucher) throw new Error('Voucher não encontrado ou inativo');
  
  // 2. Verifica tipo de voucher e regras específicas
  switch (voucher.type) {
    case 'comum':
      await validateCommonVoucher(voucher, mealType, timestamp);
      break;
    case 'extra':
      await validateExtraVoucher(voucher, mealType, timestamp);
      break;
    case 'descartavel':
      await validateDisposableVoucher(voucher, mealType, timestamp);
      break;
  }
  
  // 3. Verifica limites de uso
  await validateUsageLimits(voucher.userId, mealType);
  
  // 4. Verifica horário da refeição
  await validateMealTime(mealType, timestamp);
  
  return { valid: true, voucher };
}
```

### 4.2 Registro de Uso
```sql
CREATE OR REPLACE FUNCTION register_voucher_usage(
  p_voucher_id UUID,
  p_tipo_refeicao_id UUID,
  p_valor DECIMAL
) RETURNS UUID AS $$
DECLARE
  v_uso_id UUID;
BEGIN
  -- Registra uso
  INSERT INTO uso_voucher (
    voucher_id,
    tipo_refeicao_id,
    valor,
    data_uso
  ) VALUES (
    p_voucher_id,
    p_tipo_refeicao_id,
    p_valor,
    CURRENT_TIMESTAMP
  ) RETURNING id INTO v_uso_id;
  
  -- Atualiza status do voucher se for descartável
  UPDATE vouchers 
  SET ativo = false 
  WHERE id = p_voucher_id 
  AND tipo = 'descartavel';
  
  RETURN v_uso_id;
END;
$$ LANGUAGE plpgsql;
```

## 5. Integração com Sistemas Externos

### 5.1 Sincronização com RH
```typescript
interface EmployeeSync {
  employeeId: string;
  action: 'create' | 'update' | 'disable';
  data: EmployeeData;
}

async function syncWithHR(params: EmployeeSync): Promise<void> {
  const { employeeId, action, data } = params;
  
  // Transação para garantir consistência
  await db.transaction(async (trx) => {
    try {
      switch (action) {
        case 'create':
          await createUser(data, trx);
          await generateCommonVoucher(data.cpf, trx);
          break;
        case 'update':
          await updateUser(employeeId, data, trx);
          break;
        case 'disable':
          await disableUser(employeeId, trx);
          await disableUserVouchers(employeeId, trx);
          break;
      }
      
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  });
}
```

## 6. Auditoria e Logs

### 6.1 Sistema de Logging
```typescript
interface AuditLog {
  userId: string;
  action: string;
  resource: string;
  details: object;
  timestamp: Date;
}

async function logAuditEvent(params: AuditLog): Promise<void> {
  const { userId, action, resource, details, timestamp } = params;
  
  await db.audit_logs.insert({
    user_id: userId,
    action,
    resource,
    details: JSON.stringify(details),
    timestamp,
    ip_address: getCurrentIpAddress(),
    user_agent: getCurrentUserAgent()
  });
}
```

### 6.2 Retenção de Logs
```sql
-- Função para limpeza automática de logs
CREATE OR REPLACE FUNCTION cleanup_old_logs() RETURNS void AS $$
BEGIN
  -- Logs operacionais (6 meses)
  DELETE FROM operational_logs 
  WHERE created_at < CURRENT_DATE - INTERVAL '6 months';
  
  -- Logs de acesso (1 ano)
  DELETE FROM access_logs 
  WHERE created_at < CURRENT_DATE - INTERVAL '1 year';
  
  -- Logs de auditoria são mantidos por 5 anos
  DELETE FROM audit_logs 
  WHERE created_at < CURRENT_DATE - INTERVAL '5 years';
END;
$$ LANGUAGE plpgsql;
```

## 7. Contingência

### 7.1 Modo de Contingência
```typescript
interface ContingencyMode {
  enabled: boolean;
  reason: string;
  startTime: Date;
  authorizedBy: string;
}

async function enableContingencyMode(params: ContingencyMode): Promise<void> {
  const { reason, authorizedBy } = params;
  
  await db.transaction(async (trx) => {
    // Ativa modo de contingência
    await setSystemConfig('contingency_mode', true, trx);
    
    // Registra início
    await db.contingency_logs.insert({
      reason,
      authorized_by: authorizedBy,
      start_time: new Date(),
      status: 'active'
    }, trx);
    
    // Notifica usuários
    await notifyUsers('CONTINGENCY_MODE_ENABLED', {
      reason,
      timestamp: new Date()
    });
  });
}
```

### 7.2 Sincronização Pós-Contingência
```typescript
interface ContingencyRecord {
  voucherCode: string;
  mealType: string;
  timestamp: Date;
  authorizedBy: string;
}

async function syncContingencyRecords(
  records: ContingencyRecord[]
): Promise<SyncResult> {
  const results = {
    processed: 0,
    failed: 0,
    errors: [] as string[]
  };
  
  for (const record of records) {
    try {
      await db.transaction(async (trx) => {
        // Valida voucher retroativamente
        const validationResult = await validateVoucherHistorical(
          record,
          trx
        );
        
        // Registra uso
        if (validationResult.valid) {
          await registerHistoricalUsage(record, trx);
          results.processed++;
        }
      });
    } catch (error) {
      results.failed++;
      results.errors.push(
        `Falha ao processar voucher ${record.voucherCode}: ${error.message}`
      );
    }
  }
  
  return results;
}
```

## 8. Cache e Performance

### 8.1 Cache de Configurações
```typescript
interface CacheConfig {
  key: string;
  value: any;
  ttl: number;
}

class ConfigCache {
  private cache: Map<string, CacheConfig>;
  
  constructor() {
    this.cache = new Map();
  }
  
  async get(key: string): Promise<any> {
    const cached = this.cache.get(key);
    
    if (cached && !this.isExpired(cached)) {
      return cached.value;
    }
    
    const value = await this.fetchFromDB(key);
    this.set(key, value);
    return value;
  }
  
  private isExpired(config: CacheConfig): boolean {
    return Date.now() > config.ttl;
  }
}
```

### 8.2 Otimização de Queries
```sql
-- Índices para melhor performance
CREATE INDEX idx_vouchers_lookup ON vouchers (
  codigo,
  tipo,
  ativo
) WHERE ativo = true;

CREATE INDEX idx_uso_voucher_analysis ON uso_voucher (
  voucher_id,
  tipo_refeicao_id,
  data_uso
) INCLUDE (valor);

-- Materializada view para relatórios
CREATE MATERIALIZED VIEW mv_daily_usage_stats AS
SELECT 
  date_trunc('day', uv.data_uso) as dia,
  e.id as empresa_id,
  e.nome as empresa_nome,
  tr.id as tipo_refeicao_id,
  tr.nome as refeicao_nome,
  COUNT(*) as total_usos,
  SUM(uv.valor) as valor_total
FROM uso_voucher uv
JOIN vouchers v ON v.id = uv.voucher_id
JOIN usuarios u ON u.id = v.usuario_id
JOIN empresas e ON e.id = u.empresa_id
JOIN tipos_refeicao tr ON tr.id = uv.tipo_refeicao_id
GROUP BY 1, 2, 3, 4, 5
WITH DATA;

-- Atualização automática da view materializada
CREATE OR REPLACE FUNCTION refresh_usage_stats()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_usage_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_refresh_usage_stats
AFTER INSERT OR UPDATE OR DELETE ON uso_voucher
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_usage_stats();
```
