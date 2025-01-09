export interface AdminPermissions {
  gerenciar_vouchers_extra?: boolean;
  gerenciar_vouchers_descartaveis?: boolean;
  gerenciar_usuarios?: boolean;
  gerenciar_empresas?: boolean;
  gerenciar_tipos_refeicao?: boolean;
  gerenciar_relatorios?: boolean;
  gerenciar_imagens_fundo?: boolean;
  gerenciar_gerentes?: boolean;
  gerenciar_turnos?: boolean;
  gerenciar_refeicoes_extras?: boolean;
}

export type AdminType = 'master' | 'manager' | null;

export interface AdminState {
  adminType: AdminType;
  adminName: string | null;
  adminId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  permissions: AdminPermissions;
}