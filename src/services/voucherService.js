import { supabase } from '@/config/supabase';
import { toast } from "sonner";

export const generateUniqueCode = async () => {
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  
  const { data } = await supabase
    .from('vouchers_descartaveis')
    .select('codigo')
    .eq('codigo', code);

  if (data && data.length > 0) {
    return generateUniqueCode();
  }

  return code;
};

export const generateVouchers = async ({ selectedMealTypes, selectedDates, quantity }) => {
  try {
    const voucherIds = [];
    
    for (const data of selectedDates) {
      for (const tipo_refeicao_id of selectedMealTypes) {
        for (let i = 0; i < quantity; i++) {
          const code = await generateUniqueCode();
          
          console.log(`Gerando voucher com código ${code} para data ${data}`);
          
          const { data: voucherId, error } = await supabase
            .rpc('insert_voucher_descartavel', {
              p_tipo_refeicao_id: tipo_refeicao_id,
              p_data_expiracao: data.toISOString().split('T')[0],
              p_codigo: code
            });

          if (error) {
            console.error('Erro ao inserir voucher:', error);
            throw error;
          }

          voucherIds.push(voucherId);
        }
      }
    }

    console.log(`${voucherIds.length} vouchers gerados com sucesso`);
    toast.success(`${voucherIds.length} voucher(s) descartável(is) gerado(s) com sucesso!`);
    return voucherIds;
  } catch (error) {
    console.error('Erro ao gerar vouchers:', error);
    toast.error('Erro ao gerar vouchers: ' + error.message);
    throw error;
  }
};