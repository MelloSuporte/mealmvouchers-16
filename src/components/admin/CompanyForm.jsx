import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil } from "lucide-react";
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
        const response = await api.get('/empresas');
        return response.data || [];
      } catch (error) {
        toast.error('Erro ao carregar empresas');
        console.error('Erro ao carregar empresas:', error);
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

      let response;
      if (editingCompany) {
        response = await api.put(`/empresas/${editingCompany.id}`, companyData);
        toast.success('Empresa atualizada com sucesso!');
      } else {
        response = await api.post('/empresas', companyData);
        toast.success('Empresa cadastrada com sucesso!');
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