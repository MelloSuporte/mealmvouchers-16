# Políticas RLS Administrativas

## Overview
Políticas para operações administrativas em vouchers.

```sql
-- Enable RLS on admin operations
ALTER TABLE admin_voucher_ops ENABLE ROW LEVEL SECURITY;

-- Admin operations policy
CREATE POLICY "admin_voucher_ops_policy" ON admin_voucher_ops
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.role = 'admin'
            AND NOT au.suspenso
        )
    );

-- System operations policy
CREATE POLICY "system_voucher_ops_policy" ON admin_voucher_ops
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'sistema' = 'true'
        )
    );
```