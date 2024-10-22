import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from 'axios';

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
      setLogo(file);
    } else {
      toast.error("Por favor, selecione uma imagem PNG.");
    }
  };

  const handleSaveCompany = async () => {
    try {
      const formData = new FormData();
      formData.append('companyName', companyName);
      formData.append('cnpj', cnpj);
      if (logo) {
        formData.append('logo', logo);
      }

      const response = await axios.post('http://localhost:5000/api/companies', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Empresa salva:', response.data);
      toast.success("Empresa cadastrada com sucesso!");
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      toast.error("Erro ao cadastrar empresa. Por favor, tente novamente.");
    }
  };

  const resetForm = () => {
    setCompanyName("");
    setCnpj("");
    setLogo(null);
  };

  return (
    <form className="space-y-4">
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