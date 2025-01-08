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
  const { adminId, isAuthenticated, checkAuth } = useAdmin();

  const selectedRefeicaoId = watch('refeicao_id');
  const selectedRefeicao = refeicoes?.find(ref => ref.id === selectedRefeicaoId);

  React.useEffect(() => {
    if (selectedRefeicao) {
      setValue('valor', selectedRefeicao.valor);
    }
  }, [selectedRefeicao, setValue]);

  const onSubmit = async (data) => {
    try {
      // Ensure admin is authenticated and refresh session
      if (!isAuthenticated || !adminId) {
        await checkAuth();
        if (!isAuthenticated || !adminId) {
          toast.error("Você precisa estar autenticado como administrador");
          return;
        }
      }

      if (!selectedUser) {
        toast.error("Selecione um usuário");
        return;
      }

      const refeicao = refeicoes?.find(ref => ref.id === data.refeicao_id);
      
      if (!refeicao) {
        toast.error("Selecione uma refeição");
        return;
      }

      logger.info('Iniciando cadastro de refeição extra:', {
        usuario: selectedUser.id,
        refeicao: refeicao.id,
        adminId,
        data_consumo: data.data_consumo
      });

      // Get fresh session before making the request
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Erro de autenticação: Sessão inválida');
      }

      // Set auth header explicitly
      const { error } = await supabase
        .from('refeicoes_extras')
        .insert({
          usuario_id: selectedUser.id,
          tipo_refeicao_id: refeicao.id,
          valor: refeicao.valor,
          quantidade: data.quantidade || 1,
          data_consumo: data.data_consumo,
          observacao: data.observacao,
          ativo: true,
          autorizado_por: adminId,
          nome_refeicao: refeicao.nome
        })
        .select()
        .single();

      if (error) {
        logger.error('Erro ao inserir refeição:', error);
        throw error;
      }

      toast.success("Refeição extra registrada com sucesso!");
      generatePDF({ ...data, usuario: selectedUser });
      reset();
      setSelectedUser(null);
    } catch (error) {
      logger.error('Erro ao registrar refeição:', error);
      if (error.message.includes('auth') || error.message.includes('401')) {
        toast.error("Erro de autenticação. Por favor, faça login novamente.");
      } else if (error.code === '42501') {
        toast.error("Erro de permissão. Verifique se você tem as permissões necessárias.");
      } else {
        toast.error("Erro ao registrar refeição extra: " + error.message);
      }
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
              {...register("refeicao_id", { required: true })}
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
            {errors.refeicao_id && (
              <span className="text-red-500">Selecione uma refeição</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantidade">Quantidade</Label>
            <Input
              type="number"
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