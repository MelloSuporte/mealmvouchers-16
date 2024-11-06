import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { validateImageFile } from '../../../utils/validations';
import { toast } from "sonner";

const CompanyFormFields = ({
  companyName,
  setCompanyName,
  cnpj,
  setCnpj,
  logo,
  setLogo,
  isSubmitting,
  editingCompany,
  onSave
}) => {
  const handleCNPJChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 14) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
      setCnpj(value);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        validateImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogo(reader.result);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <Input
        placeholder="Nome da empresa"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        required
        minLength={3}
      />
      <Input
        placeholder="CNPJ (99.999.999/9999-99)"
        value={cnpj}
        onChange={handleCNPJChange}
        required
      />
      <div>
        <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2">
          Logo da Empresa
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
        onClick={onSave}
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Salvando..." : (editingCompany ? "Atualizar Empresa" : "Cadastrar Empresa")}
      </Button>
    </form>
  );
};

export default CompanyFormFields;