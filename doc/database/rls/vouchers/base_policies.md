# Políticas RLS Base para Vouchers

## Overview
Políticas base que se aplicam a todos os tipos de vouchers.

```sql
-- Enable RLS on vouchers table
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Base select policy
CREATE POLICY "vouchers_select_policy" ON vouchers
    FOR SELECT TO authenticated
    USING (
        usuario_id = auth.uid()
        OR 
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'gestor')
            AND NOT u.suspenso
        )
    );

-- Base insert policy
CREATE POLICY "vouchers_insert_policy" ON vouchers
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'system'
        )
    );
```