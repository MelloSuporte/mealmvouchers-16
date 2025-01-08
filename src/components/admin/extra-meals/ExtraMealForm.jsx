import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import UserSearchDialog from '../UserSearchDialog';
import { useUserSearch } from '../../../hooks/useUserSearch';
import { useRefeicoes } from '../../../hooks/useRefeicoes';
import { format } from 'date-fns';
import { supabase } from '../../../config/supabase';
import { useAdmin } from '../../../contexts/AdminContext';
import { useForm } from 'react-hook-form';
import AdminLoginDialog from '../../AdminLoginDialog';
import logger from '../../../config/logger';

const ExtraMealForm = () => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const { searchUser, selectedUser, setSelectedUser } = useUserSearch();
  const { data: refeicoes, isLoading: isLoadingRefeicoes, error: refeicoesError } = useRefeicoes();
  const { adminId, hasPermission, checkAuth } = useAdmin();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const selectedRefeicaoId = watch('refeicoes');
  const selectedRefeicao = refeicoes?.find(ref => ref.id === selectedRefeicaoId);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setValue('usuario_id', user.id);
  };

  React.useEffect(() => {
    if (selectedUser) {
      setValue('usuario_id', selectedUser.id);
    }
  }, [selectedUser, setValue]);

  const onSubmit = async (data) => {
    try {
      if (!hasPermission('gerenciar_refeicoes_extras')) {
        toast.error("Você não tem permissão para cadastrar refeições extras");
        return;
      }

      if (!selectedUser) {
        toast.error("Por favor, selecione um usuário");
        return;
      }

      if (!data.refeicoes) {
        toast.error("Por favor, selecione uma refeição");
        return;
      }

      logger.info('Iniciando cadastro de refeição extra:', {
        usuario: selectedUser.id,
        refeicao: data.refeicoes,
        adminId,
        data_consumo: data.data_consumo
      });

      // Verificar a sessão antes de fazer a requisição
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.session?.access_token) {
        logger.warn('Sessão não encontrada ou expirada');
        setShowLoginDialog(true);
        return;
      }

      // Atualizar o cliente Supabase com o token atual
      const { error: authError } = await supabase.auth.setSession({
        access_token: session.session.access_token,
        refresh_token: session.session.refresh_token
      });

      if (authError) {
        logger.error('Erro ao atualizar sessão:', authError);
        setShowLoginDialog(true);
        return;
      }

      const { data: refeicaoExtra, error } = await supabase
        .from('refeicoes_extras')
        .insert([
          {
            usuario_id: selectedUser.id,
            tipo_refeicao_id: data.refeicoes,
            criado_por: adminId,
            data_consumo: data.data_consumo
          }
        ])
        .select()
        .single();

      if (error) {
        logger.error('Erro ao cadastrar refeição extra:', error);
        toast.error("Erro ao cadastrar refeição extra");
        return;
      }

      logger.info('Refeição extra cadastrada com sucesso:', refeicaoExtra);
      toast.success("Refeição extra cadastrada com sucesso!");
      reset();
      setSelectedUser(null);

    } catch (error) {
      logger.error('Erro ao processar cadastro de refeição extra:', error);
      toast.error("Erro ao processar a solicitação");
    }
  };

  return (
    <div className="space-y-4 p-4">
      <UserSearchDialog onSelect={handleUserSelect} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="refeicoes">Refeições</label>
          <select {...register('refeicoes', { required: true })}>
            {refeicoes?.map(refeicao => (
              <option key={refeicao.id} value={refeicao.id}>
                {refeicao.nome}
              </option>
            ))}
          </select>
          {errors.refeicoes && <span>Este campo é obrigatório</span>}
        </div>
        <div>
          <label htmlFor="data_consumo">Data de Consumo</label>
          <input type="date" {...register('data_consumo', { required: true })} />
          {errors.data_consumo && <span>Este campo é obrigatório</span>}
        </div>
        <Button type="submit">Cadastrar Refeição Extra</Button>
      </form>
      <AdminLoginDialog 
        isOpen={showLoginDialog} 
        onClose={() => setShowLoginDialog(false)} 
      />
    </div>
  );
};

export default ExtraMealForm;
