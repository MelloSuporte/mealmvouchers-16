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
import { X } from 'lucide-react';
import EditMealDialog from './EditMealDialog';

const ExtraMealForm = () => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const { searchUser } = useUserSearch();
  const [selectedUsers, setSelectedUsers] = React.useState([]);
  const { data: refeicoes, isLoading: isLoadingRefeicoes, error: refeicoesError, refetch: refetchRefeicoes } = useRefeicoes();
  const { adminId, adminName } = useAdmin();

  const selectedRefeicaoId = watch('refeicoes');
  const selectedRefeicao = refeicoes?.find(ref => ref.id === selectedRefeicaoId);

  React.useEffect(() => {
    if (selectedRefeicao) {
      setValue('valor', selectedRefeicao.valor);
      setValue('nome_refeicao', selectedRefeicao.nome);
    }
  }, [selectedRefeicao, setValue]);

  const handleUserSearch = async (cpf) => {
    try {
      const cleanCPF = cpf.replace(/\D/g, '');
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('cpf', cleanCPF)
        .single();

      if (error) {
        toast.error('Usuário não encontrado');
        return;
      }

      if (data) {
        const userExists = selectedUsers.some(user => user.id === data.id);
        if (!userExists) {
          setSelectedUsers(prev => [...prev, data]);
          toast.success('Usuário adicionado!');
        } else {
          toast.error('Usuário já adicionado');
        }
      }
    } catch (error) {
      logger.error('Erro ao buscar usuário:', error);
      toast.error('Erro ao buscar usuário');
    }
  };

  const removeUser = (userId) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId));
  };

  const onSubmit = async (data) => {
    try {
      logger.info('Iniciando registro de refeição extra:', {
        usuarios: selectedUsers.map(u => u.id),
        adminId,
        refeicao: data.refeicoes
      });

      if (selectedUsers.length === 0) {
        toast.error("Selecione pelo menos um usuário");
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

      const [year, month, day] = data.data_consumo.split('-');
      const dataConsumo = `${year}-${month}-${day}`;

      for (const user of selectedUsers) {
        const { error: insertError } = await supabase
          .from('refeicoes_extras')
          .insert({
            usuario_id: user.id,
            refeicoes: refeicao.id,
            valor: refeicao.valor,
            quantidade: data.quantidade || 1,
            data_consumo: dataConsumo,
            observacao: data.observacao,
            autorizado_por: adminId,
            nome_refeicao: refeicao.nome,
            ativo: true
          });

        if (insertError) {
          logger.error('Erro ao inserir refeição:', insertError);
          toast.error(`Erro ao registrar refeição para ${user.nome}`);
          continue;
        }
      }

      generatePDF({ 
        ...data, 
        usuarios: selectedUsers, 
        data_consumo: dataConsumo,
        requesterName: adminName // Adding the requester's name
      });

      logger.info('Refeições extras registradas com sucesso');
      toast.success("Refeições extras registradas com sucesso!");
      reset();
      setSelectedUsers([]);

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
            <div className="flex gap-2">
              <Input
                id="cpf"
                placeholder="Digite o CPF"
                onChange={(e) => searchUser(e.target.value)}
                onBlur={(e) => handleUserSearch(e.target.value)}
              />
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div className="space-y-2 col-span-2">
              <Label>Usuários Selecionados</Label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div 
                    key={user.id} 
                    className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1"
                  >
                    <span>{user.nome}</span>
                    <button
                      type="button"
                      onClick={() => removeUser(user.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="refeicao">Refeição</Label>
            <div className="flex items-center gap-2">
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
              {selectedRefeicao && (
                <EditMealDialog 
                  meal={selectedRefeicao} 
                  onUpdate={refetchRefeicoes}
                />
              )}
            </div>
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

        <Button 
          type="submit" 
          className="w-fit px-4"
          disabled={selectedUsers.length === 0}
        >
          Registrar Refeição Extra
        </Button>
      </form>
    </Card>
  );
};

export default ExtraMealForm;
