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
} from "@/components/ui/dialog";

const NovoTurnoDialog = ({ isOpen, onOpenChange, novoTurno, setNovoTurno, onCreateTurno }) => {
  if (!novoTurno) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              value={novoTurno.tipo_turno}
              onValueChange={(value) => setNovoTurno({ ...novoTurno, tipo_turno: value })}
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
              value={novoTurno.hora_inicio}
              onChange={(e) => setNovoTurno({ ...novoTurno, hora_inicio: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Horário de Saída</Label>
            <Input
              type="time"
              value={novoTurno.hora_fim}
              onChange={(e) => setNovoTurno({ ...novoTurno, hora_fim: e.target.value })}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={novoTurno.ativo}
              onCheckedChange={(checked) => setNovoTurno({ ...novoTurno, ativo: checked })}
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

export default NovoTurnoDialog;