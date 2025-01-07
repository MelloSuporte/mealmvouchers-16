import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useUserSearch } from '../../../hooks/useUserSearch';
import { useMealTypes } from '../../../hooks/useMealTypes';
import { useRefeicoes } from '../../../hooks/useRefeicoes';
import { generatePDF } from './pdfGenerator';
import { supabase } from '../../../config/supabase';
import { useAdmin } from '../../../contexts/AdminContext';
import { useForm } from 'react-hook-form';
import logger from '../../../config/logger';

const ExtraMealForm = () => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const { searchUser, selectedUser, setSelectedUser } = useUserSearch();
  const { data: mealTypes } = useMealTypes();
  const { data: refeicoes } = useRefeicoes();
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
      if (!isAuthenticated) {
        logger.error('Admin não autenticado');
        toast.error("Você precisa estar autenticado como administrador");
        return;
      }

      const { data: session } = await supabase.auth.getSession();
      logger.info('Status da sessão:', {
        hasSession: !!session?.session,
        accessToken: !!session?.session?.access_token,
        adminId,
        isAuthenticated
      });

      if (!session?.session?.access_token) {
        logger.error('Sessão Supabase não encontrada');
        await checkAuth();
        toast.error("Erro de autenticação. Tentando reconectar...");
        return;
      }

      if (!selectedUser) {
        toast.error("Selecione um usuário");
        return;
      }

      const mealType = mealTypes?.find(type => type.id === data.tipo_refeicao_id);
      const refeicao = refeicoes?.find(ref => ref.id === data.refeicao_id);
      
      if (!refeicao) {
        toast.error("Selecione uma refeição");
        return;
      }

      logger.info('Iniciando cadastro de refeição extra:', {
        usuario: selectedUser.id,
        refeicao: refeicao.id,
        adminId,
        sessionExists: !!session?.session,
        authToken: !!session?.session?.access_token
      });

      const { error } = await supabase
        .from('refeicoes_extras')
        .insert({
          usuario_id: selectedUser.id,
          tipo_refeicao_id: data.tipo_refeicao_id,
          nome_refeicao: mealType?.nome || '',
          valor: refeicao.valor,
          quantidade: data.quantidade,
          data_consumo: data.data_consumo,
          observacao: data.observacao,
          ativo: true,
          autorizado_por: adminId
        })
        .select();

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
      toast.error("Erro ao registrar refeição extra: " + error.message);
    }
  };

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
            <Label htmlFor="tipo_refeicao">Tipo de Refeição</Label>
            <select
              {...register("tipo_refeicao_id", { required: true })}
              className="w-full p-2 border rounded"
            >
              <option value="">Selecione...</option>
              {mealTypes?.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="refeicao">Refeição</Label>
            <select
              {...register("refeicao_id", { required: true })}
              className="w-full p-2 border rounded"
            >
              <option value="">Selecione...</option>
              {refeicoes?.map((refeicao) => (
                <option key={refeicao.id} value={refeicao.id}>
                  {refeicao.nome} - R$ {Number(refeicao.valor).toFixed(2)}
                </option>
              ))}
            </select>
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