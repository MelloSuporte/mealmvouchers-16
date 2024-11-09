import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';
import CompanySelect from '../user/CompanySelect';

const AdminForm = ({ onClose, adminToEdit = null }) => {
  const [formData, setFormData] = useState({
    nome: adminToEdit?.nome || '',
    email: adminToEdit?.email || '',
    cpf: adminToEdit?.cpf || '',
    empresa_id: adminToEdit?.empresa_id || '',
    senha: '',
    permissoes: {
      gerenciar_vouchers_extra: false,
      gerenciar_vouchers_descartaveis: false,
      gerenciar_usuarios: false,
      gerenciar_relatorios: false
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.empresa_id) {
        toast.error('Por favor, selecione uma empresa');
        return;
      }

      if (adminToEdit) {
        await api.put(`/api/usuarios-admin/${adminToEdit.id}`, formData);
        toast.success('Gestor atualizado com sucesso!');
      } else {
        await api.post('/api/usuarios-admin', formData);
        toast.success('Gestor cadastrado com sucesso!');
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar gestor:', error);
      toast.error('Erro ao salvar gestor: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Nome completo"
        value={formData.nome}
        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
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
        value={formData.senha}
        onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
      />

      <div className="space-y-2">
        <Label>Empresa</Label>
        <CompanySelect 
          value={formData.empresa_id}
          onValueChange={(value) => setFormData({ ...formData, empresa_id: value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Permissões</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.permissoes.gerenciar_vouchers_extra}
              onCheckedChange={(checked) => 
                setFormData({
                  ...formData,
                  permissoes: {
                    ...formData.permissoes,
                    gerenciar_vouchers_extra: checked
                  }
                })
              }
            />
            <Label>Gerenciar Vouchers Extra</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.permissoes.gerenciar_vouchers_descartaveis}
              onCheckedChange={(checked) => 
                setFormData({
                  ...formData,
                  permissoes: {
                    ...formData.permissoes,
                    gerenciar_vouchers_descartaveis: checked
                  }
                })
              }
            />
            <Label>Gerenciar Vouchers Descartáveis</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.permissoes.gerenciar_usuarios}
              onCheckedChange={(checked) => 
                setFormData({
                  ...formData,
                  permissoes: {
                    ...formData.permissoes,
                    gerenciar_usuarios: checked
                  }
                })
              }
            />
            <Label>Gerenciar Usuários</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.permissoes.gerenciar_relatorios}
              onCheckedChange={(checked) => 
                setFormData({
                  ...formData,
                  permissoes: {
                    ...formData.permissoes,
                    gerenciar_relatorios: checked
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