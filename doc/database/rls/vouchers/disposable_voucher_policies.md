# Políticas RLS para Vouchers Descartáveis

## Overview
Políticas específicas para vouchers descartáveis.

```sql
-- Enable RLS
ALTER TABLE vouchers_descartaveis ENABLE ROW LEVEL SECURITY;

-- Select policy
CREATE POLICY "vouchers_descartaveis_select_policy" ON vouchers_descartaveis
    FOR SELECT TO authenticated
    USING (
        NOT usado
        OR
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'gestor')
            AND NOT u.suspenso
        )
    );

-- Insert policy (admins and managers)
CREATE POLICY "vouchers_descartaveis_insert_policy" ON vouchers_descartaveis
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