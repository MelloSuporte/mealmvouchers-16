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

const MealTypeFields = ({ formData, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div className="space-y-2">
          <label htmlFor="nome" className="text-sm font-medium">
            Nome
          </label>
          <Input
            id="nome"
            name="nome"
            value={formData.nome || ''}
            onChange={onChange}
            placeholder="Nome do tipo de refeição"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="horario_inicio" className="text-sm font-medium">
            Horário Início
          </label>
          <Input
            id="horario_inicio"
            name="horario_inicio"
            type="time"
            value={formData.horario_inicio || ''}
            onChange={onChange}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="horario_fim" className="text-sm font-medium">
            Horário Fim
          </label>
          <Input
            id="horario_fim"
            name="horario_fim"
            type="time"
            value={formData.horario_fim || ''}
            onChange={onChange}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="valor" className="text-sm font-medium">
            Valor
          </label>
          <Input
            id="valor"
            name="valor"
            type="number"
            step="0.01"
            value={formData.valor || ''}
            onChange={onChange}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="max_usuarios_por_dia" className="text-sm font-medium">
            Máximo de Usuários por Dia
          </label>
          <Input
            id="max_usuarios_por_dia"
            name="max_usuarios_por_dia"
            type="number"
            value={formData.max_usuarios_por_dia || ''}
            onChange={onChange}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="minutos_tolerancia" className="text-sm font-medium">
            Minutos de Tolerância
          </label>
          <Input
            id="minutos_tolerancia"
            name="minutos_tolerancia"
            type="number"
            value={formData.minutos_tolerancia || ''}
            onChange={onChange}
            placeholder="0"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="ativo"
            name="ativo"
            checked={formData.ativo}
            onCheckedChange={(checked) => 
              onChange({ target: { name: 'ativo', value: checked } })
            }
          />
          <label htmlFor="ativo" className="text-sm font-medium">
            Ativo
          </label>
        </div>
      </div>
    </div>
  );
};

export default MealTypeFields;