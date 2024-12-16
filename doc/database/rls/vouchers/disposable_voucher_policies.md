# Disposable Voucher RLS Policies

## Overview
Disposable vouchers can be used without authentication using a 4-digit code. The system validates:
- Expiration date
- One-time use
- Meal type restrictions

## Policies

### SELECT Policy
```sql
CREATE POLICY "allow_voucher_descartavel_select_by_code" ON vouchers_descartaveis
    FOR SELECT USING (true);
```

This policy allows checking voucher validity without authentication.

## Validation Rules
- Must be used before expiration date
- Can only be used once
- Must match specified meal type