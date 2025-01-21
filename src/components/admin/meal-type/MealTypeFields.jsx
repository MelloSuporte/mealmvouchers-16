import React from 'react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const MealTypeFields = ({ formData = {}, onChange }) => {
  const {
    nome = '',
    horario_inicio = '',
    horario_fim = '',
    valor = '',
    max_usuarios_por_dia = '',
    minutos_tolerancia = '',
    ativo = true
  } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ target: { name, value } });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome" className="text-sm font-medium">
            Nome
          </Label>
          <Input
            id="nome"
            name="nome"
            value={nome}
            onChange={handleChange}
            placeholder="Nome do tipo de refeição"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="horario_inicio" className="text-sm font-medium">
            Horário Início
          </Label>
          <Input
            id="horario_inicio"
            name="horario_inicio"
            type="time"
            value={horario_inicio}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="horario_fim" className="text-sm font-medium">
            Horário Fim
          </Label>
          <Input
            id="horario_fim"
            name="horario_fim"
            type="time"
            value={horario_fim}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor" className="text-sm font-medium">
            Valor
          </Label>
          <Input
            id="valor"
            name="valor"
            type="number"
            step="0.01"
            value={valor}
            onChange={handleChange}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_usuarios_por_dia" className="text-sm font-medium">
            Máximo de Usuários por Dia
          </Label>
          <Input
            id="max_usuarios_por_dia"
            name="max_usuarios_por_dia"
            type="number"
            value={max_usuarios_por_dia}
            onChange={handleChange}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minutos_tolerancia" className="text-sm font-medium">
            Minutos de Tolerância
          </Label>
          <Input
            id="minutos_tolerancia"
            name="minutos_tolerancia"
            type="number"
            value={minutos_tolerancia}
            onChange={handleChange}
            placeholder="15"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="ativo"
            name="ativo"
            checked={ativo}
            onCheckedChange={(checked) => 
              onChange({ target: { name: 'ativo', value: checked } })
            }
          />
          <Label htmlFor="ativo" className="text-sm font-medium">
            Ativo
          </Label>
        </div>
      </div>
    </div>
  );
};

export default MealTypeFields;