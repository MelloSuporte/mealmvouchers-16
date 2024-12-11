import logger from '../config/logger';
import { supabase } from '../config/supabase';

export const validateVoucherComum = async (voucher) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        id,
        nome,
        empresa_id,
        turno_id,
        empresas (
          nome,
          ativo
        ),
        turnos (
          tipo_turno,
          horario_inicio,
          horario_fim
        )
      `)
      .eq('voucher', voucher)
      .eq('suspenso', false)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Voucher inválido');
    if (!data.empresas?.ativo) throw new Error('Empresa inativa');
    
    return data;
  } catch (error) {
    logger.error('Erro ao validar voucher comum:', error);
    throw error;
  }
};

export const validateVoucherTime = (currentTime, mealType) => {
  if (!mealType.hora_inicio || !mealType.hora_fim) {
    throw new Error('Horários não definidos para este tipo de refeição');
  }

  const now = new Date();
  const [startHours, startMinutes] = mealType.hora_inicio.split(':');
  const [endHours, endMinutes] = mealType.hora_fim.split(':');
  
  const startTime = new Date(now.setHours(parseInt(startHours), parseInt(startMinutes), 0));
  const endTime = new Date(now.setHours(parseInt(endHours), parseInt(endMinutes) + (mealType.minutos_tolerancia || 15), 0));

  const currentDate = new Date();
  currentDate.setHours(parseInt(currentTime.split(':')[0]), parseInt(currentTime.split(':')[1]), 0);

  if (currentDate < startTime || currentDate > endTime) {
    logger.warn(`Tentativa de uso fora do horário permitido: ${currentTime}`);
    throw new Error(`Esta refeição só pode ser utilizada entre ${mealType.hora_inicio} e ${mealType.hora_fim} (tolerância de ${mealType.minutos_tolerancia || 15} minutos)`);
  }
};

export const validateDisposableVoucherRules = async (voucher, supabase) => {
  console.log('Validando voucher descartável:', voucher);

  if (voucher.usado) {
    console.log('Voucher já foi utilizado');
    throw new Error('Este voucher já foi utilizado');
  }

  const expirationDate = new Date(voucher.data_expiracao);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expirationDate.setHours(0, 0, 0, 0);
  
  if (expirationDate < today) {
    console.log('Voucher expirado');
    throw new Error('Este voucher está expirado');
  }

  if (expirationDate > today) {
    const formattedDate = expirationDate.toLocaleDateString('pt-BR');
    console.log('Voucher válido apenas para:', formattedDate);
    throw new Error(`Este voucher é válido apenas para ${formattedDate}`);
  }

  const { data: voucherMealType, error: voucherMealTypeError } = await supabase
    .from('tipos_refeicao')
    .select('*')
    .eq('id', voucher.tipo_refeicao_id)
    .single();

  if (voucherMealTypeError || !voucherMealType) {
    console.log('Erro ao buscar tipo de refeição do voucher:', voucherMealTypeError);
    throw new Error('Tipo de refeição do voucher não encontrado');
  }

  if (!voucherMealType.ativo) {
    throw new Error('Este tipo de refeição não está mais ativo');
  }

  console.log('Comparando tipos de refeição:', {
    voucherType: voucherMealType.nome,
    selectedType: voucher.tipos_refeicao.nome
  });

  if (voucherMealType.nome.toLowerCase() !== voucher.tipos_refeicao.nome.toLowerCase()) {
    throw new Error(`Este voucher é válido apenas para ${voucherMealType.nome}`);
  }

  const currentTime = new Date().toTimeString().slice(0, 5);
  console.log('Verificando horário específico da refeição:', currentTime);
  
  if (voucherMealType.hora_inicio && voucherMealType.hora_fim) {
    const now = new Date();
    const [startHours, startMinutes] = voucherMealType.hora_inicio.split(':');
    const [endHours, endMinutes] = voucherMealType.hora_fim.split(':');
    
    const startTime = new Date(now.setHours(parseInt(startHours), parseInt(startMinutes), 0));
    const endTime = new Date(now.setHours(parseInt(endHours), parseInt(endMinutes) + (voucherMealType.minutos_tolerancia || 15), 0));
    
    const currentDateTime = new Date();
    currentDateTime.setHours(parseInt(currentTime.split(':')[0]), parseInt(currentTime.split(':')[1]), 0);

    if (currentDateTime < startTime || currentDateTime > endTime) {
      throw new Error(`${voucherMealType.nome} só pode ser utilizado entre ${voucherMealType.hora_inicio} e ${voucherMealType.hora_fim} (tolerância de ${voucherMealType.minutos_tolerancia || 15} minutos)`);
    }
  }

  return true;
};

export const validateVoucherByType = (voucherType, { code, cpf, mealType, user }) => {
  switch (voucherType) {
    case 'DISPOSABLE':
      if (!code || !mealType) {
        throw new Error('Código do voucher e tipo de refeição são obrigatórios para voucher descartável');
      }
      if (mealType.toLowerCase() === 'extra') {
        throw new Error('Voucher Descartável não disponível para uso Extra');
      }
      break;

    case 'NORMAL':
      if (!code || !cpf || !mealType) {
        throw new Error('CPF, código do voucher e tipo de refeição são obrigatórios para voucher normal');
      }
      if (!user) {
        throw new Error('Usuário não encontrado ou voucher inválido');
      }
      break;

    case 'EXTRA':
      if (!code || !cpf || !mealType) {
        throw new Error('CPF, código do voucher e tipo de refeição são obrigatórios para voucher extra');
      }
      if (!user?.id) {
        throw new Error('Usuário não encontrado para voucher extra');
      }
      break;

    default:
      throw new Error('Tipo de voucher inválido');
  }
};
