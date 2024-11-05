import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from '../../utils/api';

const CompanyForm = () => {
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [logo, setLogo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCNPJChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 14) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
      setCnpj(value);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida.");
      return;
    }

    if (file.size > 5242880) { // 5MB
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogo(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCompany = async () => {
    if (!companyName || !cnpj) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post('/companies', {
        name: companyName,
        cnpj,
        logo
      });

      if (response.data) {
        toast.success('Empresa cadastrada com sucesso!');
        setCompanyName("");
        setCnpj("");
        setLogo(null);
      }
    } catch (error) {
      console.error('Error details:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao cadastrar empresa';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <Input
        placeholder="Nome da empresa"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        required
      />
      <Input
        placeholder="CNPJ (99.999.999/9999-99)"
        value={cnpj}
        onChange={handleCNPJChange}
        required
      />
      <div>
        <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2">
          Logo da Empresa (máx. 5MB)
        </label>
        <Input
          id="logo"
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          className="mb-2"
        />
        {logo && (
          <img 
            src={logo} 
            alt="Preview" 
            className="w-32 h-32 object-contain border rounded-lg"
          />
        )}
      </div>
      <Button 
        type="button" 
        onClick={handleSaveCompany}
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Cadastrando..." : "Cadastrar Empresa"}
      </Button>
    </form>
  );
};

export default CompanyForm;