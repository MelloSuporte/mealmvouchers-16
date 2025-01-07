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
      logger.info('Iniciando processo de login admin:', { email: formData.email });

      // Admin master hardcoded
      if (formData.password === '0001000') {
        logger.info('Login master admin detectado');
        
        // Autenticação anônima no Supabase
        const { error: authError } = await supabase.auth.signInAnonymously();
        if (authError) throw authError;

        localStorage.setItem('adminToken', 'master-admin-token');
        localStorage.setItem('adminType', 'master');
        localStorage.setItem('adminId', 'master');
        localStorage.setItem('adminName', 'Administrador Master');
        localStorage.setItem('adminPermissions', JSON.stringify({
          gerenciar_vouchers_extra: true,
          gerenciar_vouchers_descartaveis: true,
          gerenciar_usuarios: true,
          gerenciar_relatorios: true,
          gerenciar_imagens_fundo: true,
          gerenciar_gerentes: true,
          gerenciar_turnos: true,
          gerenciar_refeicoes_extras: true
        }));
        
        onClose();
        navigate('/admin');
        toast.success("Login realizado com sucesso!");
        return;
      }

      // Login gerente
      logger.info('Buscando admin_user na tabela:', { email: formData.email });
      
      // Primeiro, autenticar anonimamente no Supabase
      const { error: authError } = await supabase.auth.signInAnonymously();
      if (authError) throw authError;
      
      const { data: admin, error } = await supabase
        .from('admin_users')
        .select('*, empresas(id, nome)')
        .eq('email', formData.email)
        .eq('senha', formData.password)
        .eq('suspenso', false)
        .single();

      if (error) {
        logger.error('Erro ao buscar admin:', { error, details: error.details });
        console.error('Detalhes completos do erro:', error);
        toast.error("Email ou senha incorretos");
        return;
      }

      if (admin) {
        logger.info('Admin encontrado com sucesso:', { 
          id: admin.id, 
          nome: admin.nome,
          empresa: admin.empresas?.nome,
          permissoes: admin.permissoes 
        });
        
        localStorage.setItem('adminToken', 'admin-token-' + admin.id);
        localStorage.setItem('adminType', 'manager');
        localStorage.setItem('adminId', admin.id);
        localStorage.setItem('adminName', admin.nome || 'Usuário Gerente');
        localStorage.setItem('adminPermissions', JSON.stringify(admin.permissoes));
        localStorage.setItem('adminEmpresa', admin.empresas?.nome || '');
        
        logger.info('Estado final da autenticação:', {
          adminId: admin.id,
          adminType: 'manager',
          adminName: admin.nome,
          empresa: admin.empresas?.nome,
          permissoes: admin.permissoes
        });
        
        onClose();
        navigate('/admin');
        toast.success("Login realizado com sucesso!");
      } else {
        logger.warn('Nenhum admin encontrado com as credenciais fornecidas');
        toast.error("Email ou senha incorretos");
      }
    } catch (error) {
      logger.error('Erro crítico no login:', error);
      console.error('Erro completo:', error);
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