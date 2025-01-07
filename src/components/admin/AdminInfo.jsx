import React from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent } from "@/components/ui/card";

const AdminInfo = () => {
  const { adminType, hasPermission } = useAdmin();
  
  const adminId = localStorage.getItem('adminId');
  const adminName = localStorage.getItem('adminName') || 'Usuário não identificado';
  const adminEmpresa = localStorage.getItem('adminEmpresa') || 'Empresa não identificada';
  
  const permissions = {
    gerenciar_vouchers_extra: hasPermission('gerenciar_vouchers_extra'),
    gerenciar_vouchers_descartaveis: hasPermission('gerenciar_vouchers_descartaveis'),
    gerenciar_usuarios: hasPermission('gerenciar_usuarios'),
    gerenciar_relatorios: hasPermission('gerenciar_relatorios'),
    gerenciar_refeicoes_extras: hasPermission('gerenciar_refeicoes_extras')
  };

  const permissionLabels = {
    gerenciar_vouchers_extra: "Gerenciar Vouchers Extra",
    gerenciar_vouchers_descartaveis: "Gerenciar Vouchers Descartáveis",
    gerenciar_usuarios: "Gerenciar Usuários",
    gerenciar_relatorios: "Gerenciar Relatórios",
    gerenciar_refeicoes_extras: "Refeições Extras"
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <h3 className="text-[0.5rem] font-semibold mb-2">Informações do Usuário</h3>
        <div className="space-y-2">
          <p><span className="text-[0.5rem] font-medium">Nome:</span> <span className="text-[0.5rem]">{adminName}</span></p>
          <p><span className="text-[0.5rem] font-medium">Empresa:</span> <span className="text-[0.5rem]">{adminEmpresa}</span></p>
          <p><span className="text-[0.5rem] font-medium">Tipo de Admin:</span> <span className="text-[0.5rem]">{adminType === 'master' ? 'Administrador Master' : 'Gerente'}</span></p>
          <div>
            <p className="text-[0.5rem] font-medium mb-1">Permissões:</p>
            <ul className="list-disc pl-5 space-y-1">
              {Object.entries(permissions)
                .filter(([_, value]) => value) // Only show enabled permissions
                .map(([key]) => (
                  <li key={key} className="text-green-600 text-[0.5rem]">
                    {permissionLabels[key]}
                  </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminInfo;