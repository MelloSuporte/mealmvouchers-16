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

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['empresas'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('empresas')
          .select('*')
          .order('nome');

        if (error) throw error;

        return data.map(company => ({
          id: company.id,
          name: company.nome,
          cnpj: company.cnpj,
          logo: company.logo,
          createdAt: company.criado_em
        }));
      } catch (error) {
        console.error('Erro ao carregar empresas:', error);
        toast.error('Erro ao carregar empresas: ' + error.message);
        return [];
      }
    }
  });

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
      
      let logoUrl = null;
      if (logo instanceof File) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('logos')
          .upload(`company-logos/${Date.now()}-${logo.name}`, logo);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(uploadData.path);
          
        logoUrl = publicUrl;
      }

      const companyData = {
        nome: trimmedName,
        cnpj: cnpj.replace(/[^\d]/g, ''),
        logo: logoUrl
      };

      if (editingCompany) {
        const { error } = await supabase
          .from('empresas')
          .update(companyData)
          .eq('id', editingCompany.id);

        if (error) throw error;
        toast.success('Empresa atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('empresas')
          .insert([companyData]);

        if (error) throw error;
        toast.success('Empresa cadastrada com sucesso!');
      }
      
      resetForm();
      queryClient.invalidateQueries(['empresas']);
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      toast.error('Erro ao salvar empresa: ' + error.message);
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