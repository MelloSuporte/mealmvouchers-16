# Voucher Usage Policies

## Overview
Policies controlling voucher usage and validation.

```sql
-- Enable RLS on uso_voucher table
ALTER TABLE uso_voucher ENABLE ROW LEVEL SECURITY;

-- Policy for registering voucher usage (no auth required)
CREATE POLICY "allow_voucher_usage_registration" ON uso_voucher
    FOR INSERT
    WITH CHECK (true);

-- Policy for viewing usage history (authenticated users only)
CREATE POLICY "allow_view_usage_history" ON uso_voucher
    FOR SELECT
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
```