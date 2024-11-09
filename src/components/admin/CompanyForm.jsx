import React, { useState } from 'react';
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from '../../utils/api';
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
      try {
        const response = await api.get('/companies');
        return response.data || [];
      } catch (error) {
        console.error('Erro ao carregar empresas:', error);
        toast.error('Erro ao carregar empresas: ' + (error.response?.data?.error || error.message));
        return [];
      }
    }
  });

  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setCompanyName(company.nome);
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
    if (!companyName?.trim()) {
      toast.error('Nome da empresa é obrigatório');
      return;
    }

    if (!cnpj?.trim()) {
      toast.error('CNPJ é obrigatório');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const companyData = {
        nome: companyName,
        cnpj: cnpj.replace(/[^\d]/g, ''),
        logo
      };

      if (editingCompany) {
        await api.put(`/companies/${editingCompany.id}`, companyData);
        toast.success('Empresa atualizada com sucesso!');
      } else {
        const response = await api.post('/companies', companyData);
        if (response.data) {
          toast.success('Empresa cadastrada com sucesso!');
        }
      }
      
      resetForm();
      queryClient.invalidateQueries(['companies']);
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      const errorMessage = error.response?.data?.error || "Erro ao salvar empresa";
      toast.error(errorMessage);
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