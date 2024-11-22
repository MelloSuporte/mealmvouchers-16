import React, { useState } from 'react';
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from '../../config/supabase';
import CompanyList from './company/CompanyList';
import CompanyFormFields from './company/CompanyFormFields';

const CompanyForm = () => {
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [logo, setLogo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading, error } = useQuery({
    queryKey: ['empresas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erro ao carregar empresas:', error);
        throw new Error(error.message);
      }

      return (data || []).map(company => ({
        id: company.id,
        name: company.name,
        cnpj: company.cnpj,
        logo: company.logo,
        createdAt: company.created_at
      }));
    }
  });

  const handleEditCompany = (company) => {
    if (!company) return;
    
    setEditingCompany(company);
    setCompanyName(company.name || '');
    setCnpj(company.cnpj || '');
    setLogo(company.logo);
  };

  const resetForm = () => {
    setCompanyName("");
    setCnpj("");
    setLogo(null);
    setEditingCompany(null);
  };

  const handleSaveCompany = async () => {
    const trimmedName = companyName?.trim();
    
    if (!trimmedName) {
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
        name: trimmedName,
        cnpj: cnpj.replace(/[^\d]/g, ''),
        logo: logo
      };

      let response;

      if (editingCompany) {
        response = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', editingCompany.id)
          .select()
          .single();

        if (response.error) throw response.error;
        toast.success('Empresa atualizada com sucesso!');
      } else {
        response = await supabase
          .from('companies')
          .insert([companyData])
          .select()
          .single();

        if (response.error) throw response.error;
        toast.success('Empresa cadastrada com sucesso!');
      }

      resetForm();
      queryClient.invalidateQueries(['empresas']);
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      toast.error(`Erro ao salvar empresa: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return <div>Erro ao carregar empresas: {error.message}</div>;
  }

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