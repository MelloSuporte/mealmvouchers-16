import React from 'react';
import { Input } from "@/components/ui/input";

const CompanyFormFields = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4">
      <Input
        placeholder="Nome da Empresa"
        value={formData.nome || ''}
        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
      />
      <Input
        placeholder="CNPJ"
        value={formData.cnpj || ''}
        onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
      />
      <Input
        placeholder="Endereço"
        value={formData.endereco || ''}
        onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
      />
      <Input
        placeholder="Cidade"
        value={formData.cidade || ''}
        onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
      />
      <Input
        placeholder="Estado"
        value={formData.estado || ''}
        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
      />
      <Input
        placeholder="CEP"
        value={formData.cep || ''}
        onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
      />
    </div>
  );
};

export default CompanyFormFields;
