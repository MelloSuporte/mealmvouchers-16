import React from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent } from "@/components/ui/card";

const AdminInfo = () => {
  const { adminType, hasPermission } = useAdmin();
  
  // Recupera as informações do admin do localStorage
  const adminId = localStorage.getItem('adminId');
  const adminName = localStorage.getItem('adminName') || 'Usuário não identificado';
  const adminEmpresa = localStorage.getItem('adminEmpresa') || 'Empresa não identificada';
  
  const permissions = {
    gerenciar_vouchers_extra: hasPermission('gerenciar_vouchers_extra'),
    gerenciar_vouchers_descartaveis: hasPermission('gerenciar_vouchers_descartaveis'),
    gerenciar_usuarios: hasPermission('gerenciar_usuarios'),
    gerenciar_relatorios: hasPermission('gerenciar_relatorios')
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <h3 className="text-base font-semibold mb-2">Informações do Usuário</h3>
        <div className="space-y-2">
          <p><span className="font-medium">Nome:</span> {adminName}</p>
          <p><span className="font-medium">Empresa:</span> {adminEmpresa}</p>
          <p><span className="font-medium">Tipo de Admin:</span> {adminType === 'master' ? 'Administrador Master' : 'Gerente'}</p>
          <div>
            <p className="font-medium mb-1">Permissões:</p>
            <ul className="list-disc pl-5 space-y-1">
              {Object.entries(permissions).map(([key, value]) => (
                <li key={key} className={value ? 'text-green-600' : 'text-red-600'}>
                  {key.replace(/_/g, ' ')} - {value ? 'Sim' : 'Não'}
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