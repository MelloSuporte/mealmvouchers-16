export type VoucherType = 'comum' | 'descartavel' | 'extra';

export interface ValidationResult {
  success: boolean;
  error?: string;
  data?: any;
}

export interface VoucherValidationParams {
  code: string;
  mealTypeId: string;
  shiftId?: string;
  userId?: string;
}

export interface MealType {
  id: string;
  nome: string;
  horario_inicio: string;
  horario_fim: string;
  minutos_tolerancia: number;
  ativo: boolean;
}