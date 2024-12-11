import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto p-4 bg-card rounded-lg shadow-sm">
      <div className="space-y-2">
        <Label htmlFor="companyName" className="text-sm font-medium">
          Nome da Empresa
        </Label>
        <Input
          id="companyName"
          placeholder="Digite o nome da empresa"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="h-9 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cnpj" className="text-sm font-medium">
          CNPJ
        </Label>
        <Input
          id="cnpj"
          placeholder="Digite o CNPJ"
          value={cnpj}
          onChange={(e) => setCnpj(e.target.value)}
          className="h-9 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo" className="text-sm font-medium">
          Logo
        </Label>
        <Input
          id="logo"
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          className="h-9 text-sm file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium hover:file:bg-accent"
        />
        {logo && (typeof logo === 'string' ? (
          <img src={logo} alt="Logo preview" className="mt-2 w-24 h-24 object-contain rounded-md border" />
        ) : (
          <img 
            src={URL.createObjectURL(logo)} 
            alt="Logo preview" 
            className="mt-2 w-24 h-24 object-contain rounded-md border" 
          />
        ))}
      </div>

      <Button 
        onClick={onSave}
        disabled={isSubmitting}
        className="w-full h-9 text-sm"
      >
        {isSubmitting ? 'Salvando...' : editingCompany ? 'Atualizar Empresa' : 'Cadastrar Empresa'}
      </Button>
    </div>
  );
};

export default CompanyFormFields;