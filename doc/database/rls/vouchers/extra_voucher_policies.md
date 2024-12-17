# Políticas RLS para Vouchers Extras

## Overview
Políticas específicas para vouchers extras.

```sql
-- Enable RLS
ALTER TABLE vouchers_extras ENABLE ROW LEVEL SECURITY;

-- Select policy
CREATE POLICY "vouchers_extras_select_policy" ON vouchers_extras
    FOR SELECT TO authenticated
    USING (
        usuario_id = auth.uid()
        OR
        autorizado_por = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

-- Insert policy (admins and managers)
CREATE POLICY "vouchers_extras_insert_policy" ON vouchers_extras
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'gestor')
            AND NOT u.suspenso
        )
    );
```