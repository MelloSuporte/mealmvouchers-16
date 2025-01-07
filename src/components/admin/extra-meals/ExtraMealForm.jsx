import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useUserSearch } from '../../../hooks/useUserSearch';
import { useMealTypes } from '../../../hooks/useMealTypes';
import { generatePDF } from './pdfGenerator';
import { supabase } from '../../../config/supabase';

const ExtraMealForm = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { searchUser, selectedUser, setSelectedUser } = useUserSearch();
  const { data: mealTypes } = useMealTypes();

  const onSubmit = async (data) => {
    try {
      if (!selectedUser) {
        toast.error("Selecione um usuário");
        return;
      }

      const mealType = mealTypes?.find(type => type.id === data.tipo_refeicao_id);
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Erro ao obter sessão:', sessionError);
        toast.error("Erro de autenticação");
        return;
      }

      const { error } = await supabase
        .from('refeicoes_extras')
        .insert({
          usuario_id: selectedUser.id,
          tipo_refeicao_id: data.tipo_refeicao_id,
          nome_refeicao: mealType?.nome || '',
          valor: data.valor,
          quantidade: data.quantidade,
          data_consumo: data.data_consumo,
          observacao: data.observacao,
          ativo: true,
          autorizado_por: session?.user?.id || 'sistema'
        });

      if (error) {
        console.error('Erro ao inserir refeição:', error);
        throw error;
      }

      toast.success("Refeição extra registrada com sucesso!");
      generatePDF({ ...data, usuario: selectedUser });
      reset();
      setSelectedUser(null);
    } catch (error) {
      console.error('Erro ao registrar refeição:', error);
      toast.error("Erro ao registrar refeição extra");
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
            <Label htmlFor="valor">Valor</Label>
            <Input
              type="number"
              step="0.01"
              {...register("valor", { required: true, min: 0 })}
            />
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