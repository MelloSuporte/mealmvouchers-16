import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';

const AdminForm = ({ onClose, adminToEdit = null }) => {
  const [formData, setFormData] = useState({
    name: adminToEdit?.name || '',
    email: adminToEdit?.email || '',
    cpf: adminToEdit?.cpf || '',
    company_id: adminToEdit?.company_id || '',
    password: '',
    permissions: {
      manage_extra_vouchers: false,
      manage_disposable_vouchers: false,
      manage_users: false,
      manage_reports: false
    }
  });

  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/companies');
        return response.data || [];
      } catch (error) {
        console.error('Error fetching companies:', error);
        toast.error('Erro ao carregar empresas');
        return [];
      }
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.company_id) {
        toast.error('Por favor, selecione uma empresa');
        return;
      }

      if (adminToEdit) {
        await api.put(`/api/admin-users/${adminToEdit.id}`, formData);
        toast.success('Gestor atualizado com sucesso!');
      } else {
        await api.post('/api/admin-users', formData);
        toast.success('Gestor cadastrado com sucesso!');
      }
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar gestor: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Nome completo"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <Input
        placeholder="E-mail"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <Input
        placeholder="CPF"
        value={formData.cpf}
        onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
      />
      <Input
        placeholder="Senha"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />

      <div className="space-y-2">
        <Label>Empresa</Label>
        <Select 
          value={formData.company_id} 
          onValueChange={(value) => setFormData({ ...formData, company_id: value })}
          disabled={isLoadingCompanies}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingCompanies ? "Carregando empresas..." : "Selecione a empresa"} />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id.toString()}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Permissões</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.permissions.manage_extra_vouchers}
              onCheckedChange={(checked) => 
                setFormData({
                  ...formData,
                  permissions: {
                    ...formData.permissions,
                    manage_extra_vouchers: checked
                  }
                })
              }
            />
            <Label>Gerenciar Vouchers Extra</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.permissions.manage_disposable_vouchers}
              onCheckedChange={(checked) => 
                setFormData({
                  ...formData,
                  permissions: {
                    ...formData.permissions,
                    manage_disposable_vouchers: checked
                  }
                })
              }
            />
            <Label>Gerenciar Vouchers Descartáveis</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.permissions.manage_users}
              onCheckedChange={(checked) => 
                setFormData({
                  ...formData,
                  permissions: {
                    ...formData.permissions,
                    manage_users: checked
                  }
                })
              }
            />
            <Label>Gerenciar Usuários</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.permissions.manage_reports}
              onCheckedChange={(checked) => 
                setFormData({
                  ...formData,
                  permissions: {
                    ...formData.permissions,
                    manage_reports: checked
                  }
                })
              }
            />
            <Label>Gerenciar Relatórios</Label>
          </div>
        </div>
      </div>

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