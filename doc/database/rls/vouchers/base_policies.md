# Base Voucher RLS Policies

## Overview
These policies define the base access rules for all voucher types in the system.

## Table: usuarios (voucher column)
```sql
-- Enable RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Policy for validating voucher by code (no auth required)
CREATE POLICY "allow_voucher_validation_by_code" ON usuarios
    FOR SELECT 
    USING (true);

-- Policy for system to update voucher usage
CREATE POLICY "allow_system_voucher_update" ON usuarios
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'system'
        )
    );
```