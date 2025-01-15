-- Backup of uso_voucher view RLS policies before modifications
-- Generated on: 2024-05-20

-- Store existing RLS policies
CREATE OR REPLACE VIEW backup_uso_voucher_policies_20240520 AS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'uso_voucher'
OR tablename = 'vw_uso_voucher_detalhado';

-- Store existing permissions
CREATE OR REPLACE VIEW backup_uso_voucher_permissions_20240520 AS
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'uso_voucher'
OR table_name = 'vw_uso_voucher_detalhado';

-- Add helpful comments
COMMENT ON VIEW backup_uso_voucher_policies_20240520 IS 
'Backup of uso_voucher RLS policies from 2024-05-20';

COMMENT ON VIEW backup_uso_voucher_permissions_20240520 IS 
'Backup of uso_voucher permissions from 2024-05-20';