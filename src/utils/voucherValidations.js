import logger from '../config/logger';
import { VOUCHER_TYPES } from './voucherTypes';

export const validateVoucherTime = (currentTime, mealType, toleranceMinutes) => {
  const endTime = new Date();
  const [endHours, endMinutes] = mealType.end_time.split(':');
  endTime.setHours(parseInt(endHours), parseInt(endMinutes) + toleranceMinutes);
  const endTimeWithTolerance = endTime.toTimeString().slice(0, 5);

  if (currentTime < mealType.start_time || currentTime > endTimeWithTolerance) {
    logger.warn(`Tentativa de uso fora do horário permitido: ${currentTime}`);
    throw new Error(`Esta refeição só pode ser utilizada entre ${mealType.start_time} e ${mealType.end_time} (tolerância de ${toleranceMinutes} minutos)`);
  }
};

export const validateDisposableVoucherRules = async (voucher, supabase) => {
  // Verificar se o voucher já foi usado
  if (voucher.is_used) {
    throw new Error('Voucher Descartável já foi utilizado');
  }

  // Verificar se o voucher está expirado
  if (voucher.data_expiracao) {
    const expirationDate = new Date(voucher.data_expiracao);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expirationDate.setHours(0, 0, 0, 0);
    
    if (expirationDate < today) {
      throw new Error('Voucher Expirado');
    }

    if (expirationDate > today) {
      const formattedDate = expirationDate.toISOString().split('T')[0];
      throw new Error(`Voucher Descartável válido para o ${formattedDate}`);
    }
  }

  // Verificar se já foi usado hoje para o mesmo tipo de refeição
  const today = new Date().toISOString().split('T')[0];
  const { data: usedToday, error } = await supabase
    .from('vouchers_descartaveis')
    .select('*')
    .eq('tipo_refeicao_id', voucher.tipo_refeicao_id)
    .eq('usado', true)
    .gte('data_uso', today)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 é o código para "não encontrado"
    logger.error('Erro ao verificar uso do voucher:', error);
    throw new Error('Erro ao validar voucher');
  }

  if (usedToday) {
    throw new Error('Já foi utilizado um voucher para este tipo de refeição hoje');
  }

  // Verificar horário da refeição
  const currentTime = new Date().toTimeString().slice(0, 5);
  validateVoucherTime(currentTime, voucher, voucher.minutos_tolerancia || 15);
};

export const validateVoucherByType = (voucherType, { code, cpf, mealType, user }) => {
  switch (voucherType) {
    case VOUCHER_TYPES.NORMAL:
      if (!code || !cpf || !mealType) {
        throw new Error('CPF, código do voucher e tipo de refeição são obrigatórios para voucher normal');
      }
      if (!user) {
        throw new Error('Usuário não encontrado ou voucher inválido');
      }
      break;

    case VOUCHER_TYPES.EXTRA:
      if (!code || !cpf || !mealType) {
        throw new Error('CPF, código do voucher e tipo de refeição são obrigatórios para voucher extra');
      }
      if (!user?.id) {
        throw new Error('Usuário não encontrado para voucher extra');
      }
      break;

    case VOUCHER_TYPES.DISPOSABLE:
      if (!code || !mealType) {
        throw new Error('Código do voucher e tipo de refeição são obrigatórios para voucher descartável');
      }
      if (mealType.toLowerCase() === 'extra') {
        throw new Error('Voucher Descartável não disponível para uso Extra');
      }
      break;

    default:
      throw new Error('Tipo de voucher inválido');
  }
};