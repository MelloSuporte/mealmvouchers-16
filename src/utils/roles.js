export const ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  OPERATOR: 'operator',
  USER: 'user'
};

export const PERMISSIONS = {
  [ROLES.ADMIN]: ['all'],
  [ROLES.SUPERVISOR]: ['manage_users', 'view_reports', 'generate_reports'],
  [ROLES.OPERATOR]: ['validate_vouchers', 'view_users'],
  [ROLES.USER]: ['use_voucher']
};

export const hasPermission = (userRole, requiredPermission) => {
  if (!userRole || !requiredPermission) return false;
  const permissions = PERMISSIONS[userRole];
  return permissions?.includes('all') || permissions?.includes(requiredPermission);
};