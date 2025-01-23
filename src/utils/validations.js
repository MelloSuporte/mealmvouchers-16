import { supabase } from '../config/database';

export const validateVoucherUso = async (userId, tipoRefeicaoId, voucherType = 'comum') => {
  try {
    // Validar usuário
    const { data: user } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();

    if (!user || user.suspenso) {
      throw new Error('Usuário inválido ou suspenso');
    }

    // Validar empresa
    const { data: empresa } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', user.empresa_id)
      .single();

    if (!empresa || !empresa.ativo) {
      throw new Error('Empresa inativa ou inválida');
    }

    // Validar tipo de refeição
    const { data: tipoRefeicao } = await supabase
      .from('tipos_refeicao')
      .select('*')
      .eq('id', tipoRefeicaoId)
      .single();

    if (!tipoRefeicao || !tipoRefeicao.ativo) {
      throw new Error('Tipo de refeição inválido ou inativo');
    }

    // Validar limite diário
    const today = new Date().toISOString().split('T')[0];
    const { data: usosHoje } = await supabase
      .from('uso_voucher')
      .select('*')
      .eq('usuario_id', userId)
      .gte('usado_em', today);

    if (usosHoje && usosHoje.length >= 2) {
      throw new Error('Limite diário de refeições atingido');
    }

    // Validar intervalo entre refeições
    const { data: ultimoUso } = await supabase
      .from('uso_voucher')
      .select('*')
      .eq('usuario_id', userId)
      .order('usado_em', { ascending: false })
      .limit(1)
      .single();

    if (ultimoUso) {
      const ultimoUsoTime = new Date(ultimoUso.usado_em).getTime();
      const now = new Date().getTime();
      const diffHours = (now - ultimoUsoTime) / (1000 * 60 * 60);

      if (diffHours < 3) {
        throw new Error('Intervalo mínimo entre refeições não atingido');
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Erro na validação:', error);
    return { 
      success: false, 
      error: error.message || 'Erro na validação do voucher' 
    };
  }
};

export const registrarUsoVoucher = async (userId, tipoRefeicaoId, voucherType = 'comum') => {
  try {
    const validation = await validateVoucherUso(userId, tipoRefeicaoId, voucherType);
    
    if (!validation.success) {
      throw new Error(validation.error);
    }

    const { data, error } = await supabase
      .from('uso_voucher')
      .insert([
        {
          usuario_id: userId,
          tipo_refeicao_id: tipoRefeicaoId,
          tipo_voucher: voucherType,
          usado_em: new Date().toISOString()
        }
      ]);

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Erro ao registrar uso:', error);
    return {
      success: false,
      error: error.message || 'Erro ao registrar uso do voucher'
    };
  }
};