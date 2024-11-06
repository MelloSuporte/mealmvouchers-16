import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import api from '../utils/api';

const AdminLoginDialog = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);

      // Admin master
      if (password === '0001000') {
        localStorage.setItem('adminToken', 'master-admin-token');
        localStorage.setItem('adminType', 'master');
        onClose();
        navigate('/admin');
        toast.success("Login realizado com sucesso!");
        return;
      }

      // Login gerente
      const response = await api.post('/api/admin/login', { password });
      
      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminType', 'manager');
        onClose();
        navigate('/admin');
        toast.success("Login realizado com sucesso!");
      } else {
        toast.error("Senha incorreta");
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error("Erro ao realizar login");
    } finally {
      setIsSubmitting(false);
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
          disabled={isSubmitting}
        />
        <DialogFooter>
          <Button 
            onClick={handleLogin} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processando..." : "Entrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminLoginDialog;