# Common Voucher RLS Policies

## Overview
Common vouchers can be used without authentication using a 4-digit code. The system validates:
- Active user status
- Active company
- Valid shift times
- Daily usage limits
- Minimum interval between meals

## Policies

### SELECT Policy
```sql
CREATE POLICY "allow_voucher_comum_select_by_code" ON vouchers_comuns
    FOR SELECT USING (true);
```

This policy allows checking voucher validity without authentication.

## Validation Rules
- Maximum 3 meals per day
- Minimum 3-hour interval between meals
- Must be within allowed meal times for user's shift
- User and company must be active