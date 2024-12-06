import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EditarTurnoDialog = ({ isOpen, onOpenChange, turno, onSave }) => {
  const [turnoEditado, setTurnoEditado] = React.useState(turno);

  React.useEffect(() => {
    setTurnoEditado(turno);
  }, [turno]);

  if (!turno) return null;

  const handleSave = () => {
    onSave(turnoEditado);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Turno</DialogTitle>
          <DialogDescription>
            Altere as informações do turno
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Horário de Entrada</Label>
            <Input
              type="time"
              value={turnoEditado?.hora_inicio || ''}
              onChange={(e) => setTurnoEditado({ ...turnoEditado, hora_inicio: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Horário de Saída</Label>
            <Input
              type="time"
              value={turnoEditado?.hora_fim || ''}
              onChange={(e) => setTurnoEditado({ ...turnoEditado, hora_fim: e.target.value })}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={turnoEditado?.ativo}
              onCheckedChange={(checked) => setTurnoEditado({ ...turnoEditado, ativo: checked })}
            />
            <Label>Turno Ativo</Label>
          </div>
          <Button onClick={handleSave} className="w-full">
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditarTurnoDialog;