import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAdmin } from '@/contexts/AdminContext';
import { supabase } from '@/config/supabase';
import { toast } from "sonner";
import logger from '@/config/logger';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const ExtraMealForm = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, adminId, adminName } = useAdmin();

  const onSubmit = async (data) => {
    try {
      if (!isAuthenticated || !adminId) {
        logger.error('Admin não autenticado', { adminId, isAuthenticated });
        toast.error("Você precisa estar autenticado como administrador");
        return;
      }

      setIsSubmitting(true);
      logger.info('Iniciando cadastro de refeição extra', { 
        adminId,
        adminName,
        data 
      });

      const { error } = await supabase
        .from('refeicoes_extras')
        .insert({
          ...data,
          criado_por: adminId,
          criado_por_nome: adminName,
          data_registro: new Date().toISOString()
        });

      if (error) {
        logger.error('Erro ao cadastrar refeição extra:', error);
        toast.error("Erro ao cadastrar refeição extra");
        return;
      }

      logger.info('Refeição extra cadastrada com sucesso');
      toast.success("Refeição extra cadastrada com sucesso!");
      reset();
    } catch (error) {
      logger.error('Erro inesperado ao cadastrar refeição:', error);
      toast.error("Erro ao cadastrar refeição");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              {...register("cpf", { required: true })}
              placeholder="Digite o CPF"
            />
            {errors.cpf && <span className="text-red-500">CPF é obrigatório</span>}
          </div>

          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              {...register("nome", { required: true })}
              placeholder="Digite o nome"
            />
            {errors.nome && <span className="text-red-500">Nome é obrigatório</span>}
          </div>

          <div>
            <Label htmlFor="empresa">Empresa</Label>
            <Input
              id="empresa"
              {...register("empresa", { required: true })}
              placeholder="Digite a empresa"
            />
            {errors.empresa && <span className="text-red-500">Empresa é obrigatória</span>}
          </div>

          <div>
            <Label htmlFor="observacao">Observação</Label>
            <Input
              id="observacao"
              {...register("observacao")}
              placeholder="Digite uma observação (opcional)"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || !isAuthenticated}
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar Refeição Extra"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExtraMealForm;