import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const AdminPermissionsForm = ({ permissions, onPermissionChange }) => {
  const permissionLabels = {
    gerenciar_vouchers_extra: "Gerenciar Vouchers Extra",
    gerenciar_vouchers_descartaveis: "Gerenciar Vouchers Descartáveis",
    gerenciar_usuarios: "Gerenciar Usuários",
    gerenciar_relatorios: "Gerenciar Relatórios",
    gerenciar_refeicoes_extras: "Refeições Extras"
  };

  return (
    <div className="space-y-2">
      <Label>Permissões</Label>
      <div className="space-y-2">
        {Object.entries(permissionLabels).map(([key, label]) => (
          <div key={key} className="flex items-center space-x-2">
            <Checkbox
              checked={permissions[key]}
              onCheckedChange={(checked) => onPermissionChange(key, checked)}
            />
            <Label>{label}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};