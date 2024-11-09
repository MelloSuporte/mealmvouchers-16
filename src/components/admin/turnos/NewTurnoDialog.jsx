import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

const NewTurnoDialog = ({ isOpen, onOpenChange, newTurno, setNewTurno, onCreateTurno }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Turno
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Turno</DialogTitle>
          <DialogDescription>
            Preencha as informações para criar um novo turno
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Turno</Label>
            <Select
              value={newTurno.tipo}
              onValueChange={(value) => setNewTurno({ ...newTurno, tipo: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de turno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="central">Turno Central (Administrativo)</SelectItem>
                <SelectItem value="primeiro">Primeiro Turno</SelectItem>
                <SelectItem value="segundo">Segundo Turno</SelectItem>
                <SelectItem value="terceiro">Terceiro Turno</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Horário de Entrada</Label>
            <Input
              type="time"
              value={newTurno.hora_inicio}
              onChange={(e) => setNewTurno({ ...newTurno, hora_inicio: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Horário de Saída</Label>
            <Input
              type="time"
              value={newTurno.hora_fim}
              onChange={(e) => setNewTurno({ ...newTurno, hora_fim: e.target.value })}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={newTurno.ativo}
              onCheckedChange={(checked) => setNewTurno({ ...newTurno, ativo: checked })}
            />
            <Label>Turno Ativo</Label>
          </div>
          <Button onClick={onCreateTurno} className="w-full">
            Criar Turno
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewTurnoDialog;