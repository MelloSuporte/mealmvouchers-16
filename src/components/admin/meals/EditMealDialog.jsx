import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import { supabase } from '../../../config/supabase';
import { useQueryClient, useMutation } from '@tanstack/react-query';

export const EditMealDialog = ({ meal }) => {
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    nome: meal.nome,
    hora_inicio: meal.hora_inicio,
    hora_fim: meal.hora_fim,
    valor: meal.valor,
    max_usuarios_por_dia: meal.max_usuarios_por_dia || '',
    minutos_tolerancia: meal.minutos_tolerancia,
    ativo: meal.ativo
  });

  const queryClient = useQueryClient();

  const updateMealMutation = useMutation({
    mutationFn: async (updatedData) => {
      const { data, error } = await supabase
        .from('tipos_refeicao')
        .update(updatedData)
        .eq('id', meal.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['meals']);
      toast.success("Refeição atualizada com sucesso!");
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Erro ao atualizar refeição: " + error.message);
    }
  });

  const handleInputChange = (field, value) => {
    if (field === 'valor') {
      const numericValue = value.replace(/[^0-9.,]/g, '').replace(',', '.');
      setFormData(prev => ({
        ...prev,
        [field]: numericValue
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMealMutation.mutate({
      ...formData,
      valor: parseFloat(formData.valor),
      max_usuarios_por_dia: formData.max_usuarios_por_dia || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Refeição</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Refeição</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hora_inicio">Horário Início</Label>
              <Input
                id="hora_inicio"
                type="time"
                value={formData.hora_inicio}
                onChange={(e) => handleInputChange('hora_inicio', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hora_fim">Horário Fim</Label>
              <Input
                id="hora_fim"
                type="time"
                value={formData.hora_fim}
                onChange={(e) => handleInputChange('hora_fim', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor"
              value={formData.valor}
              onChange={(e) => handleInputChange('valor', e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_usuarios_por_dia">Limite de Usuários por Dia</Label>
            <Input
              id="max_usuarios_por_dia"
              type="number"
              value={formData.max_usuarios_por_dia}
              onChange={(e) => handleInputChange('max_usuarios_por_dia', e.target.value)}
              placeholder="Sem limite"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minutos_tolerancia">Tolerância (minutos)</Label>
            <Input
              id="minutos_tolerancia"
              type="number"
              value={formData.minutos_tolerancia}
              onChange={(e) => handleInputChange('minutos_tolerancia', e.target.value)}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => handleInputChange('ativo', checked)}
            />
            <Label htmlFor="ativo">Refeição Ativa</Label>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={updateMealMutation.isLoading}
          >
            {updateMealMutation.isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};