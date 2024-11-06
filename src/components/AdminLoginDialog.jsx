import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import api from '../utils/api';

/**
 * AVISO DE SEGURANÇA - NÃO MODIFICAR
 * 
 * Este componente contém configurações críticas de segurança para o admin master.
 * As permissões definidas aqui são essenciais para o funcionamento do sistema.
 * 
 * IMPORTANTE:
 * - Não alterar a senha do admin master
 * - Não modificar as permissões do admin master
 * - Não remover nenhuma das permissões existentes
 * 
 * Qualquer alteração neste arquivo pode comprometer a segurança do sistema.
 */

const AdminLoginDialog = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Objeto imutável com as permissões do admin master
  const MASTER_ADMIN_PERMISSIONS = Object.freeze({
    manage_extra_vouchers: true,
    manage_disposable_vouchers: true,
    manage_users: true,
    manage_reports: true,
    manage_companies: true,
    manage_meals: true,
    manage_backgrounds: true,
    manage_turnos: true,
    manage_managers: true,
    manage_system: true,
    full_access: true
  });

  const handleLogin = async () => {
    try {
      // Verificação do admin master com senha protegida
      if (password === '0001000') {
        // Cria uma cópia das permissões para evitar modificações
        const adminPermissions = { ...MASTER_ADMIN_PERMISSIONS };
        
        // Verifica se todas as permissões estão intactas
        const hasAllPermissions = Object.values(adminPermissions).every(value => value === true);
        
        if (!hasAllPermissions) {
          toast.error("Erro de segurança: Permissões do admin master foram alteradas!");
          return;
        }

        localStorage.setItem('adminToken', 'master-admin-token');
        localStorage.setItem('adminType', 'master');
        localStorage.setItem('adminPermissions', JSON.stringify(adminPermissions));
        onClose();
        navigate('/admin');
        toast.success("Login bem-sucedido como Admin Master!");
        return;
      }

      // If not master admin, try manager login
      const response = await api.post('/api/admin/login', { password });
      
      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminType', 'manager');
        localStorage.setItem('adminPermissions', JSON.stringify(response.data.permissions));
        onClose();
        navigate('/admin');
        toast.success("Login bem-sucedido!");
      } else {
        toast.error("Senha incorreta. Tente novamente.");
      }
    } catch (error) {
      toast.error("Senha incorreta. Tente novamente.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Login de Administrador</DialogTitle>
        </DialogHeader>
        <Input
          type="password"
          placeholder="Digite a senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <DialogFooter>
          <Button onClick={handleLogin}>Entrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminLoginDialog;