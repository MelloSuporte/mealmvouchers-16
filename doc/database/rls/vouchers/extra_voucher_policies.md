# Extra Voucher RLS Policies

## Overview
Extra vouchers can be used without authentication using a 4-digit code. The system validates:
- Voucher validity period
- One-time use
- Meal type restrictions
- Time restrictions

## Policies

### SELECT Policy
```sql
CREATE POLICY "allow_voucher_extra_select_by_code" ON vouchers_extras
    FOR SELECT USING (true);
```

This policy allows checking voucher validity without authentication.

## Validation Rules
- Must be used within validity period
- Can only be used once
- Must be used within allowed meal times
- Must match specified meal type