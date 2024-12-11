# Políticas RLS para Sistema

## Políticas de Sistema
```sql
-- Política para operações do sistema
CREATE POLICY "system_operations_policy" ON uso_voucher
    FOR INSERT
    WITH CHECK (
        (SELECT TRUE FROM system_auth WHERE role = 'system')
    );

-- Função para validar operação do sistema
CREATE OR REPLACE FUNCTION is_system_operation()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM system_auth 
        WHERE role = 'system'
        AND valid_until > CURRENT_TIMESTAMP
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Notas de Implementação

1. Operações do Sistema:
   - Sistema tem permissão para registrar uso
   - Validações automáticas são aplicadas
   - Logs de operação são mantidos

2. Segurança:
   - Operações restritas ao sistema
   - Validação de autenticação do sistema
   - Prevenção contra uso não autorizado