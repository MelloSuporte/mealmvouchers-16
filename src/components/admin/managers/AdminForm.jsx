import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from '../../../config/supabase';
import CompanySelect from '../user/CompanySelect';
import { formatCPF } from '../../../utils/formatters';
import { AdminPermissionsForm } from './AdminPermissionsForm';

const AdminForm = ({ onClose, adminToEdit = null }) => {
  const [formData, setFormData] = useState({
    nome: adminToEdit?.nome || '',
    email: adminToEdit?.email || '',
    cpf: formatCPF(adminToEdit?.cpf) || '',
    empresa_id: adminToEdit?.empresa_id || '',
    senha: '',
    permissoes: {
      gerenciar_vouchers_extra: adminToEdit?.permissoes?.gerenciar_vouchers_extra || false,
      gerenciar_vouchers_descartaveis: adminToEdit?.permissoes?.gerenciar_vouchers_descartaveis || false,
      gerenciar_usuarios: adminToEdit?.permissoes?.gerenciar_usuarios || false,
      gerenciar_relatorios: adminToEdit?.permissoes?.gerenciar_relatorios || false,
      gerenciar_refeicoes_extras: adminToEdit?.permissoes?.gerenciar_refeicoes_extras || false
    }
  });

  const handleCPFChange = (e) => {
    const formattedCPF = formatCPF(e.target.value);
    setFormData(prev => ({ ...prev, cpf: formattedCPF }));
  };

  const handlePermissionChange = (permission, checked) => {
    setFormData(prev => ({
      ...prev,
      permissoes: {
        ...prev.permissoes,
        [permission]: checked
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.empresa_id) {
        toast.error('Por favor, selecione uma empresa');
        return;
      }

      const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
      if (!cpfRegex.test(formData.cpf)) {
        toast.error('Por favor, insira um CPF válido no formato XXX.XXX.XXX-XX');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Por favor, insira um email válido');
        return;
      }

      const adminData = {
        nome: formData.nome,
        email: formData.email,
        cpf: formData.cpf.replace(/\D/g, ''),
        empresa_id: formData.empresa_id,
        senha: formData.senha,
        permissoes: formData.permissoes
      };

      if (adminToEdit) {
        const { error } = await supabase
          .from('admin_users')
          .update(adminData)
          .eq('id', adminToEdit.id);

        if (error) throw error;
        toast.success('Gestor atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('admin_users')
          .insert([adminData]);

        if (error) throw error;
        toast.success('Gestor cadastrado com sucesso!');
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar gestor:', error);
      toast.error('Erro ao salvar gestor: ' + (error.message || 'Erro desconhecido'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Nome completo"
        value={formData.nome}
        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
        required
      />
      <Input
        placeholder="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <Input
        placeholder="CPF (000.000.000-00)"
        value={formData.cpf}
        onChange={handleCPFChange}
        maxLength={14}
        required
      />
      <Input
        placeholder="Senha"
        type="password"
        value={formData.senha}
        onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
        required={!adminToEdit}
      />

      <div className="space-y-2">
        <Label>Empresa</Label>
        <CompanySelect 
          value={formData.empresa_id}
          onValueChange={(value) => setFormData({ ...formData, empresa_id: value })}
        />
      </div>

      <AdminPermissionsForm 
        permissions={formData.permissoes}
        onPermissionChange={handlePermissionChange}
      />

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">
          {adminToEdit ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
};

export default AdminForm;