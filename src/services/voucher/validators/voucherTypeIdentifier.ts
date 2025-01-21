import { supabase } from '../../../config/supabase';

export const identifyVoucherType = async (codigo: string) => {
  try {
    // Primeiro tenta encontrar como voucher comum
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('voucher')
      .eq('voucher', codigo)
      .maybeSingle();

    if (usuario) {
      return 'comum';
    }

    // Tenta encontrar como voucher descartável
    const { data: voucherDescartavel } = await supabase
      .from('vouchers_descartaveis')
      .select('*')
      .eq('codigo', codigo)
      .maybeSingle();

    if (voucherDescartavel) {
      return 'descartavel';
    }

    return null;
  } catch (error) {
    console.error('Erro ao identificar tipo de voucher:', error);
    return null;
  }
};