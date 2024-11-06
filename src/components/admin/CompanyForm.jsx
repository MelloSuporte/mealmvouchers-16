import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import api from '../../utils/api';
import { validateCNPJ } from '../../utils/validations';
import CompanyList from './company/CompanyList';
import CompanyFormFields from './company/CompanyFormFields';

const CompanyForm = () => {
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [logo, setLogo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await api.get('/api/companies');
      return response.data || [];
    }
  });

  const validateForm = () => {
    if (!companyName.trim() || !cnpj) {
      toast.error("Preencha todos os campos obrigatórios");
      return false;
    }

    try {
      validateCNPJ(cnpj);
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setCompanyName(company.name);
    setCnpj(company.cnpj);
    setLogo(company.logo);
  };

  const resetForm = () => {
    setCompanyName("");
    setCnpj("");
    setLogo(null);
    setEditingCompany(null);
  };

  const handleSaveCompany = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      
      const companyData = {
        name: companyName.trim(),
        cnpj: cnpj.replace(/[^\d]/g, ''),
        logo
      };

      if (editingCompany) {
        await api.put(`/api/companies/${editingCompany.id}`, companyData);
        toast.success('Empresa atualizada com sucesso!');
      } else {
        await api.post('/api/companies', companyData);
        toast.success('Empresa cadastrada com sucesso!');
      }
      
      resetForm();
      queryClient.invalidateQueries(['companies']);
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao salvar empresa");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <CompanyFormFields
        companyName={companyName}
        setCompanyName={setCompanyName}
        cnpj={cnpj}
        setCnpj={setCnpj}
        logo={logo}
        setLogo={setLogo}
        isSubmitting={isSubmitting}
        editingCompany={editingCompany}
        onSave={handleSaveCompany}
      />

      <CompanyList
        companies={companies}
        isLoading={isLoading}
        onEdit={handleEditCompany}
      />
    </div>
  );
};

export default CompanyForm;