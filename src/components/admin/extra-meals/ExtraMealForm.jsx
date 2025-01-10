import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useUserSearch } from '../../../hooks/useUserSearch';
import { useRefeicoes } from '../../../hooks/useRefeicoes';
import { generatePDF } from './pdfGenerator';
import { supabase } from '../../../config/supabase';
import { useAdmin } from '../../../contexts/AdminContext';
import { useForm } from 'react-hook-form';
import logger from '../../../config/logger';

const ExtraMealForm = () => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const { searchUser, selectedUser, setSelectedUser } = useUserSearch();
  const { data: refeicoes, isLoading: isLoadingRefeicoes, error: refeicoesError } = useRefeicoes();
  const { adminId } = useAdmin();

  const selectedRefeicaoId = watch('refeicoes');
  const selectedRefeicao = refeicoes?.find(ref => ref.id === selectedRefeicaoId);

  React.useEffect(() => {
    if (selectedRefeicao) {
      setValue('valor', selectedRefeicao.valor);
      setValue('nome_refeicao', selectedRefeicao.nome);
    }
  }, [selectedRefeicao, setValue]);

  const onSubmit = async (data) => {
    try {
      logger.info('Iniciando registro de refeição extra:', {
        usuario: selectedUser?.id,
        adminId,
        refeicao: data.refeicoes
      });

      if (!selectedUser) {
        toast.error("Selecione um usuário");
        return;
      }

      if (!adminId) {
        logger.error('ID do administrador não encontrado');
        toast.error("ID do administrador não encontrado");
        return;
      }

      const refeicao = refeicoes?.find(ref => ref.id === data.refeicoes);
      
      if (!refeicao) {
        logger.error('Refeição não encontrada:', data.refeicoes);
        toast.error("Selecione uma refeição válida");
        return;
      }

      logger.info('Dados da refeição selecionada:', refeicao);

      const { error: insertError } = await supabase
        .from('refeicoes_extras')
        .insert({
          usuario_id: selectedUser.id,
          refeicoes: refeicao.id,
          valor: refeicao.valor,
          quantidade: data.quantidade || 1,
          data_consumo: data.data_consumo,
          observacao: data.observacao,
          autorizado_por: adminId,
          nome_refeicao: refeicao.nome,
          ativo: true
        });

      if (insertError) {
        logger.error('Erro ao inserir refeição:', insertError);
        
        if (insertError.code === '42501') {
          toast.error("Permissão negada. Verifique suas credenciais de administrador.");
        } else if (insertError.code === '23503') {
          toast.error("Erro: Refeição inválida. Por favor, selecione outra refeição.");
        } else if (insertError.code === '23505') {
          toast.error("Esta refeição já foi registrada.");
        } else {
          toast.error(`Erro ao registrar refeição: ${insertError.message}`);
        }
        return;
      }

      logger.info('Refeição extra registrada com sucesso');
      toast.success("Refeição extra registrada com sucesso!");
      generatePDF({ ...data, usuario: selectedUser });
      reset();
      setSelectedUser(null);

    } catch (error) {
      logger.error('Erro ao registrar refeição:', {
        error,
        stack: error.stack,
        context: 'ExtraMealForm.onSubmit'
      });
      toast.error("Erro ao registrar refeição extra. Por favor, tente novamente.");
    }
  };

  if (refeicoesError) {
    toast.error("Erro ao carregar refeições");
    return null;
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF do Usuário</Label>
            <Input
              id="cpf"
              placeholder="Digite o CPF"
              {...register("cpf")}
              onChange={(e) => searchUser(e.target.value)}
            />
          </div>

          {selectedUser && (
            <div className="space-y-2">
              <Label>Usuário Selecionado</Label>
              <div className="p-2 bg-gray-100 rounded">
                {selectedUser.nome}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="refeicao">Refeição</Label>
            <select
              {...register("refeicoes", { required: true })}
              className="w-full p-2 border rounded"
              disabled={isLoadingRefeicoes}
            >
              <option value="">Selecione...</option>
              {refeicoes?.map((refeicao) => (
                <option key={refeicao.id} value={refeicao.id}>
                  {refeicao.nome} - R$ {Number(refeicao.valor).toFixed(2)}
                </option>
              ))}
            </select>
            {errors.refeicoes && (
              <span className="text-red-500">Selecione uma refeição</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantidade">Quantidade</Label>
            <Input
              type="number"
              min="1"
              defaultValue="1"
              {...register("quantidade", { required: true, min: 1 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_consumo">Data de Consumo</Label>
            <Input
              type="date"
              {...register("data_consumo", { required: true })}
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="observacao">Observação</Label>
            <Input {...register("observacao")} />
          </div>
        </div>

        <Button type="submit" className="w-full">
          Registrar Refeição Extra
        </Button>
      </form>
    </Card>
  );
};

export default ExtraMealForm;