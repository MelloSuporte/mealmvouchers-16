import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from "sonner";
import { supabase } from '@/config/supabase';
import logger from '@/config/logger';
import { generatePDF } from './pdfGenerator';

// Função auxiliar para retry
const retryOperation = async (operation, maxAttempts = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) break;
      
      logger.warn(`Tentativa ${attempt} falhou, tentando novamente em ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

const ExtraMealForm = ({ selectedUser, adminId, refeicao }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    if (!selectedUser?.id || !adminId || !refeicao?.id) {
      toast.error("Dados incompletos. Verifique usuário, administrador e refeição.");
      return;
    }

    setIsSubmitting(true);

    try {
      await retryOperation(async () => {
        const { error } = await supabase
          .from('refeicoes_extras')
          .insert({
            usuario_id: selectedUser.id,
            tipo_refeicao_id: refeicao.id,
            data_refeicao: data.data_refeicao,
            motivo: data.motivo,
            observacao: data.observacao || null,
            autorizado_por: adminId.toString(),
            nome_refeicao: refeicao.nome,
            ativo: true
          });

        if (error) {
          logger.error('Erro ao inserir refeição:', {
            error,
            userData: {
              userId: selectedUser.id,
              adminId,
              refeicaoId: refeicao.id
            }
          });

          if (error.code === '42501') {
            throw new Error('Permissão negada. Verifique suas credenciais de administrador.');
          }

          throw error;
        }

        logger.info('Refeição extra registrada com sucesso');
        return true;
      });

      toast.success("Refeição extra registrada com sucesso!");
      generatePDF({ ...data, usuario: selectedUser });
      reset();
      
    } catch (error) {
      toast.error(error.message || "Erro ao registrar refeição extra");
      logger.error('Erro final ao registrar refeição:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Data da Refeição</label>
        <input type="date" {...register("data_refeicao", { required: true })} />
        {errors.data_refeicao && <span>Data é obrigatória</span>}
      </div>
      <div>
        <label>Motivo</label>
        <input type="text" {...register("motivo", { required: true })} />
        {errors.motivo && <span>Motivo é obrigatório</span>}
      </div>
      <div>
        <label>Observação</label>
        <textarea {...register("observacao")} />
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Registrando...' : 'Registrar Refeição Extra'}
      </button>
    </form>
  );
};

export default ExtraMealForm;
