import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Ban } from "lucide-react";
import { toast } from "sonner";
import { supabase } from '../../../config/supabase';
import AdminForm from './AdminForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminTable = ({ admins = [], isLoading, refetchAdmins }) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [adminToEdit, setAdminToEdit] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  const handleEdit = (admin) => {
    setAdminToEdit(admin);
    setShowEditForm(true);
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminToDelete.id);

      if (error) throw error;

      toast.success('Gerente excluído com sucesso!');
      setShowDeleteDialog(false);
      setAdminToDelete(null);
      refetchAdmins();
    } catch (error) {
      console.error('Erro ao excluir gerente:', error);
      toast.error('Erro ao excluir gerente: ' + error.message);
    }
  };

  const handleSuspend = async (admin) => {
    try {
      console.log('Suspending admin:', admin.id, 'Current status:', admin.suspenso);
      
      const { error } = await supabase
        .from('admin_users')
        .update({ suspenso: !admin.suspenso })
        .eq('id', admin.id);

      if (error) throw error;

      toast.success(`Gerente ${admin.suspenso ? 'reativado' : 'suspenso'} com sucesso!`);
      refetchAdmins();
    } catch (error) {
      console.error('Erro ao suspender/reativar gerente:', error);
      toast.error('Erro ao suspender/reativar gerente: ' + error.message);
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!Array.isArray(admins)) {
    return <div>Nenhum gerente encontrado.</div>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Permissões</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.map((admin) => (
            <TableRow key={admin.id} className={admin.suspenso ? 'opacity-50' : ''}>
              <TableCell>{admin.nome}</TableCell>
              <TableCell>{admin.email}</TableCell>
              <TableCell>{admin.cpf}</TableCell>
              <TableCell>
                <ul className="list-disc list-inside">
                  {admin.permissoes?.gerenciar_vouchers_extra && (
                    <li>Gerenciar Vouchers Extra</li>
                  )}
                  {admin.permissoes?.gerenciar_vouchers_descartaveis && (
                    <li>Gerenciar Vouchers Descartáveis</li>
                  )}
                  {admin.permissoes?.gerenciar_usuarios && (
                    <li>Gerenciar Usuários</li>
                  )}
                  {admin.permissoes?.gerenciar_relatorios && (
                    <li>Gerenciar Relatórios</li>
                  )}
                </ul>
              </TableCell>
              <TableCell>
                {admin.suspenso ? 'Suspenso' : 'Ativo'}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleEdit(admin)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => {
                      setAdminToDelete(admin);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={admin.suspenso ? "default" : "secondary"}
                    size="icon"
                    onClick={() => handleSuspend(admin)}
                  >
                    <Ban className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showEditForm && (
        <AdminForm
          adminToEdit={adminToEdit}
          onClose={() => {
            setShowEditForm(false);
            setAdminToEdit(null);
            refetchAdmins();
          }}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este gerente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminTable;