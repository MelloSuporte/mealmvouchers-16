# Políticas RLS para Uso de Vouchers

## Overview
Políticas que controlam o uso e validação de vouchers.

```sql
-- Enable RLS
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Insert policy (system only)
CREATE POLICY "uso_voucher_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'sistema' = 'true'
        )
    );

-- Select policy
CREATE POLICY "uso_voucher_select_policy" ON uso_voucher
    FOR SELECT TO authenticated
    USING (
        usuario_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_usuarios' = 'true'
            AND NOT au.suspenso
        )
    );
```