import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from '../../utils/api';

const CompanyForm = () => {
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [logo, setLogo] = useState(null);

  const handleCNPJChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 14) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
      setCnpj(value);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "image/png") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Por favor, selecione uma imagem PNG.");
    }
  };

  const handleSaveCompany = async () => {
    try {
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
      toast.error("Erro ao cadastrar empresa: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <Input
        placeholder="Nome da empresa"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
      />
      <Input
        placeholder="CNPJ (99.999.999/9999-99)"
        value={cnpj}
        onChange={handleCNPJChange}
      />
      <div>
        <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
          Logo da Empresa (PNG)
        </label>
        <Input
          id="logo"
          type="file"
          accept=".png"
          onChange={handleLogoChange}
        />
      </div>
      <Button type="button" onClick={handleSaveCompany}>Cadastrar Empresa</Button>
    </form>
  );
};

export default CompanyForm;