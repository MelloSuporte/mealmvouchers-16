import { supabase } from '../../../config/supabase';
import { generateUniqueVoucherFromCPF } from '../../../utils/voucherGenerationUtils';
import { toast } from "sonner";

export const useVoucherFormLogic = (
  selectedUser,
  selectedDates,
  observacao,
  resetForm
) => {
  const handleVoucherSubmission = async () => {
    try {
      console.log('Starting voucher submission process...');
      
      // Buscar o primeiro tipo de refeição ativo
      const { data: tipoRefeicao, error: tipoRefeicaoError } = await supabase
        .from('tipos_refeicao')
        .select('id')
        .eq('ativo', true)
        .limit(1)
        .single();

      if (tipoRefeicaoError) {
        console.error('Erro ao buscar tipo de refeição:', tipoRefeicaoError);
        throw new Error('Erro ao buscar tipo de refeição');
      }

      console.log('Tipo refeição encontrado:', tipoRefeicao);

      // Buscar o CPF do usuário selecionado
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('cpf')
        .eq('id', selectedUser)
        .single();

      if (userError) {
        console.error('Erro ao buscar dados do usuário:', userError);
        throw new Error('Erro ao buscar dados do usuário');
      }

      console.log('Dados do usuário encontrados:', userData);

      const formattedDates = selectedDates.map(date => {
        const localDate = new Date(date);
        return localDate.toISOString().split('T')[0];
      });

      console.log('Datas formatadas:', formattedDates);

      // Criar vouchers extras no Supabase
      for (const data of formattedDates) {
        console.log(`Tentando criar voucher para data ${data}...`);
        
        // Gerar um novo voucher para cada data
        const voucher = await generateUniqueVoucherFromCPF(userData.cpf, data);
        console.log(`Voucher gerado para data ${data}:`, voucher);
        
        const voucherData = {
          usuario_id: selectedUser,
          tipo_refeicao_id: tipoRefeicao.id,
          autorizado_por: 'Sistema',
          codigo: voucher,
          valido_ate: data,
          observacao: observacao.trim() || 'Voucher extra gerado via sistema'
        };

        console.log('Dados do voucher a ser inserido:', voucherData);

        const { error: voucherError } = await supabase
          .from('vouchers_extras')
          .insert([voucherData]);

        if (voucherError) {
          console.error('Erro ao inserir voucher:', voucherError);
          throw voucherError;
        }

        console.log(`Voucher criado com sucesso para data ${data}`);
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