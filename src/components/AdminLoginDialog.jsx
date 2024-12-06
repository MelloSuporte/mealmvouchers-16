import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { supabase } from '../config/supabase';
import logger from '../config/logger';

const AdminLoginDialog = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      logger.info('Tentando login com email:', formData.email);

      // Admin master hardcoded
      if (formData.password === '0001000') {
        localStorage.setItem('adminToken', 'master-admin-token');
        localStorage.setItem('adminType', 'master');
        localStorage.setItem('adminPermissions', JSON.stringify({
          gerenciar_vouchers_extra: true,
          gerenciar_vouchers_descartaveis: true,
          gerenciar_usuarios: true,
          gerenciar_relatorios: true
        }));
        onClose();
        navigate('/admin');
        toast.success("Login realizado com sucesso!");
        return;
      }

      // Login gerente
      const { data: admin, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', formData.email)
        .eq('senha', formData.password)
        .eq('suspenso', false)
        .single();

      if (error) {
        logger.error('Erro ao buscar admin:', error);
        toast.error("Email ou senha incorretos");
        return;
      }

      if (admin) {
        logger.info('Admin encontrado:', { id: admin.id, nome: admin.nome });
        localStorage.setItem('adminToken', 'admin-token-' + admin.id);
        localStorage.setItem('adminType', 'manager');
        localStorage.setItem('adminId', admin.id);
        localStorage.setItem('adminPermissions', JSON.stringify(admin.permissoes));
        
        onClose();
        navigate('/admin');
        toast.success("Login realizado com sucesso!");
      } else {
        toast.error("Email ou senha incorretos");
      }
    } catch (error) {
      logger.error('Erro no login:', error);
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
          <DialogDescription>
            Digite suas credenciais para acessar o painel administrativo
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            disabled={isSubmitting}
          />
          <Input
            type="password"
            placeholder="Senha"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            disabled={isSubmitting}
          />
        </div>

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