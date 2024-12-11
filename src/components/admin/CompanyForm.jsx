import React, { useState } from 'react';
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from '../../config/supabase';
import CompanyList from './company/CompanyList';
import CompanyFormFields from './company/CompanyFormFields';
import { uploadLogo } from '../../utils/supabaseStorage';

const CompanyForm = () => {
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [logo, setLogo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [empresaEditando, setEmpresaEditando] = useState(null);
  const queryClient = useQueryClient();

  const { data: empresas = [], isLoading, error } = useQuery({
    queryKey: ['empresas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('nome');

      if (error) {
        console.error('Erro ao carregar empresas:', error);
        throw new Error(error.message);
      }

      return (data || []).map(empresa => ({
        id: empresa.id,
        nome: empresa.nome,
        cnpj: empresa.cnpj,
        logo: empresa.logo,
        createdAt: empresa.created_at
      }));
    }
  });

  const handleEditEmpresa = (empresa) => {
    if (!empresa) return;
    
    setEmpresaEditando(empresa);
    setNomeEmpresa(empresa.nome || '');
    setCnpj(empresa.cnpj || '');
    setLogo(empresa.logo);
  };

  const resetForm = () => {
    setNomeEmpresa("");
    setCnpj("");
    setLogo(null);
    setEmpresaEditando(null);
  };

  const handleSaveEmpresa = async () => {
    const trimmedName = nomeEmpresa?.trim();
    
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
        logoUrl = await uploadLogo(logo);
      } else {
        logoUrl = logo; // Mantém a URL existente se não houver novo upload
      }

      const empresaData = {
        nome: trimmedName,
        cnpj: cnpj.replace(/[^\d]/g, ''),
        logo: logoUrl
      };

      if (empresaEditando) {
        const { error } = await supabase
          .from('empresas')
          .update(empresaData)
          .eq('id', empresaEditando.id);

        if (error) throw error;
        toast.success('Empresa atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('empresas')
          .insert([empresaData]);

        if (error) throw error;
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
    return <div className="text-sm text-destructive text-center py-4">Erro ao carregar empresas: {error.message}</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <CompanyFormFields
        companyName={nomeEmpresa}
        setCompanyName={setNomeEmpresa}
        cnpj={cnpj}
        setCnpj={setCnpj}
        logo={logo}
        setLogo={setLogo}
        isSubmitting={isSubmitting}
        editingCompany={empresaEditando}
        onSave={handleSaveEmpresa}
      />

      <CompanyList
        companies={empresas}
        isLoading={isLoading}
        onEdit={handleEditEmpresa}
      />
    </div>
  );
};

export default CompanyForm;