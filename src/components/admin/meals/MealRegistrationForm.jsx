import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Utensils } from 'lucide-react';
import { supabase } from '../../../config/supabase';

const MealRegistrationForm = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const { error } = await supabase
        .from('refeicoes_extras')
        .insert([
          {
            nome: data.nome,
            valor: parseFloat(data.valor),
            ativo: true
          }
        ]);

      if (error) throw error;

      toast.success('Refeição cadastrada com sucesso!');
      reset();
    } catch (error) {
      console.error('Erro ao cadastrar refeição:', error);
      toast.error('Erro ao cadastrar refeição');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="ml-2">
          <Utensils className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar Nova Refeição</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome da Refeição</Label>
            <Input
              id="nome"
              {...register("nome", { required: "Nome é obrigatório" })}
              placeholder="Digite o nome da refeição"
            />
            {errors.nome && (
              <span className="text-sm text-red-500">{errors.nome.message}</span>
            )}
          </div>

          <div>
            <Label htmlFor="valor">Valor</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              {...register("valor", { 
                required: "Valor é obrigatório",
                min: { value: 0.01, message: "Valor deve ser maior que zero" }
              })}
              placeholder="0,00"
            />
            {errors.valor && (
              <span className="text-sm text-red-500">{errors.valor.message}</span>
            )}
          </div>

          <Button type="submit" className="w-full">
            Cadastrar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MealRegistrationForm;