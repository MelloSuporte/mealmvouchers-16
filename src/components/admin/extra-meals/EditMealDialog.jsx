import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from '../../../config/supabase';

const EditMealDialog = ({ meal, onUpdate }) => {
  const [open, setOpen] = React.useState(false);
  const [nome, setNome] = React.useState(meal.nome);
  const [valor, setValor] = React.useState(meal.valor);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('refeicoes')
        .update({ 
          nome: nome,
          valor: parseFloat(valor)
        })
        .eq('id', meal.id);

      if (error) throw error;

      toast.success('Refeição atualizada com sucesso!');
      onUpdate();
      setOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar refeição:', error);
      toast.error('Erro ao atualizar refeição');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
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
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Salvar Alterações
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMealDialog;