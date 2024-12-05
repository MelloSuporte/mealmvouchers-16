import { supabase } from '../../../config/supabase';
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

      // Buscar o usuário selecionado com seu voucher comum
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('cpf, voucher')
        .eq('id', selectedUser)
        .single();

      if (userError) {
        console.error('Erro ao buscar dados do usuário:', userError);
        throw new Error('Erro ao buscar dados do usuário');
      }

      console.log('Dados do usuário encontrados:', userData);

      if (!userData.voucher) {
        throw new Error('Usuário não possui voucher comum cadastrado');
      }

      const formattedDates = selectedDates.map(date => {
        const localDate = new Date(date);
        return localDate.toISOString().split('T')[0];
      });

      console.log('Datas formatadas:', formattedDates);

      // Criar vouchers extras no Supabase usando o mesmo código do voucher comum
      for (const data of formattedDates) {
        console.log(`Tentando criar voucher para data ${data}...`);
        
        const voucherData = {
          usuario_id: selectedUser,
          tipo_refeicao_id: tipoRefeicao.id,
          autorizado_por: 'Sistema',
          codigo: userData.voucher, // Usando o mesmo código do voucher comum
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