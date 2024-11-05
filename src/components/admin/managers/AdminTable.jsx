import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

const AdminTable = ({ admins = [], isLoading }) => {
  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!Array.isArray(admins)) {
    return <div>Nenhum gerente encontrado.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>CPF</TableHead>
          <TableHead>Permissões</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {admins.map((admin) => (
          <TableRow key={admin.id}>
            <TableCell>{admin.name}</TableCell>
            <TableCell>{admin.email}</TableCell>
            <TableCell>{admin.cpf}</TableCell>
            <TableCell>
              <ul className="list-disc list-inside">
                {admin.permissions.manage_extra_vouchers && <li>Gerenciar Vouchers Extra</li>}
                {admin.permissions.manage_disposable_vouchers && <li>Gerenciar Vouchers Descartáveis</li>}
                {admin.permissions.manage_users && <li>Gerenciar Usuários</li>}
                {admin.permissions.manage_reports && <li>Gerenciar Relatórios</li>}
              </ul>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AdminTable;