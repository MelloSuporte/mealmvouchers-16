import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import api from '../utils/api';

const AdminLoginDialog = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // First check if it's a master admin
      if (password === '0001000') {
        localStorage.setItem('adminToken', 'master-admin-token');
        localStorage.setItem('adminType', 'master');
        localStorage.setItem('adminPermissions', JSON.stringify({
          manage_extra_vouchers: true,
          manage_disposable_vouchers: true,
          manage_users: true,
          manage_reports: true
        }));
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