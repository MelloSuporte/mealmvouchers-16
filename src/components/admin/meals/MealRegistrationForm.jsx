import React from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../../config/supabase';
import { toast } from 'sonner';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';

const MealRegistrationForm = () => {
  const { register, handleSubmit, reset } = useForm();

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
          Nome da Refeição
        </label>
        <Input
          id="nome"
          type="text"
          {...register('nome', { required: true })}
          className="mt-1"
        />
      </div>
      <div>
        <label htmlFor="valor" className="block text-sm font-medium text-gray-700">
          Valor
        </label>
        <Input
          id="valor"
          type="number"
          step="0.01"
          {...register('valor', { required: true })}
          className="mt-1"
        />
      </div>
      <Button type="submit">
        Cadastrar Refeição
      </Button>
    </form>
  );
};

export default MealRegistrationForm;