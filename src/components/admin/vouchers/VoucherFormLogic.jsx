import { supabase } from '../../../config/supabase';
import { generateUniqueCode } from '../../../utils/voucherGenerationUtils';
import { toast } from "sonner";

export const useVoucherFormLogic = (
  selectedUser,
  selectedDates,
  observacao,
  resetForm
) => {
  const handleVoucherSubmission = async () => {
    try {
      // Buscar o primeiro tipo de refeição ativo
      const { data: tipoRefeicao, error: tipoRefeicaoError } = await supabase
        .from('tipos_refeicao')
        .select('id')
        .eq('ativo', true)
        .limit(1)
        .single();

      if (tipoRefeicaoError) throw new Error('Erro ao buscar tipo de refeição');

      const formattedDates = selectedDates.map(date => {
        const localDate = new Date(date);
        return localDate.toISOString().split('T')[0];
      });

      // Criar vouchers extras no Supabase
      for (const data of formattedDates) {
        const codigo = await generateUniqueCode();
        
        const { error: voucherError } = await supabase
          .from('vouchers_extras')
          .insert([{
            usuario_id: selectedUser,
            tipo_refeicao_id: tipoRefeicao.id,
            autorizado_por: 'Sistema',
            codigo,
            valido_ate: data,
            observacao: observacao.trim() || 'Voucher extra gerado via sistema'
          }]);

        if (voucherError) throw voucherError;
      }

      toast.success(`${formattedDates.length} voucher(s) extra(s) gerado(s) com sucesso!`);
      resetForm();
      
      return true;
    } catch (error) {
      console.error('Erro detalhado:', error);
      toast.error("Erro ao gerar vouchers extras: " + (error.message || 'Erro desconhecido'));
      return false;
    }
  };

  return { handleVoucherSubmission };
};