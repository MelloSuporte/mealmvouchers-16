# Políticas RLS para Vouchers Comuns

## Overview
Políticas específicas para vouchers comuns.

```sql
-- Enable RLS
ALTER TABLE vouchers_comuns ENABLE ROW LEVEL SECURITY;

-- Select policy
CREATE POLICY "vouchers_comuns_select_policy" ON vouchers_comuns
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

-- Insert policy (system only)
CREATE POLICY "vouchers_comuns_insert_policy" ON vouchers_comuns
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'system'
        )
    );
```