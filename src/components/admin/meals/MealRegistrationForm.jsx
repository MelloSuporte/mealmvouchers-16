import React from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../../config/supabase';
import { toast } from "sonner";
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';

const MealRegistrationForm = () => {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      const { error } = await supabase
        .from('tipos_refeicao')
        .insert([
          {
            nome: data.nome_refeicao,
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
    <Card className="w-full max-w-2xl mx-auto mt-6">
      <CardHeader>
        <CardTitle>Cadastrar Nova Refeição</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nome_refeicao" className="text-sm font-medium text-gray-700">
              Nome da Refeição
            </Label>
            <Input
              id="nome_refeicao"
              type="text"
              {...register('nome_refeicao', { required: true })}
              className="mt-1"
              placeholder="Digite o nome da refeição"
            />
          </div>
          <div>
            <Label htmlFor="valor" className="text-sm font-medium text-gray-700">
              Valor
            </Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              {...register('valor', { required: true })}
              className="mt-1"
              placeholder="0,00"
            />
          </div>
          <Button type="submit" className="w-full">
            Cadastrar Refeição
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MealRegistrationForm;