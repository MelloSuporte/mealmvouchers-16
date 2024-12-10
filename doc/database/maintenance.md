# Database Maintenance

## Backup and Restore

### Backup
```bash
# Full backup
pg_dump -Fc mealmvouchers > backup_$(date +%Y%m%d).dump

# Data-only backup
pg_dump -Fc --data-only mealmvouchers > data_backup_$(date +%Y%m%d).dump
```

### Restore
```bash
# Full restore
pg_restore -d mealmvouchers backup_20240101.dump

# Data-only restore
pg_restore -d mealmvouchers --data-only data_backup_20240101.dump
```

## Maintenance Queries

### Data Cleanup
```sql
-- Remove old usage records
DELETE FROM uso_voucher 
WHERE data_uso < CURRENT_DATE - INTERVAL '1 year';

-- Deactivate expired vouchers
UPDATE vouchers 
SET ativo = false 
WHERE data_validade < CURRENT_DATE;
```

### Performance Analysis
```sql
-- Check unused indexes
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;

-- Check tables needing VACUUM
SELECT relname, n_dead_tup
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
```