import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-4">
      <Input
        placeholder="Nome da Empresa"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
      />
      <Input
        placeholder="CNPJ"
        value={cnpj}
        onChange={(e) => setCnpj(e.target.value)}
      />
      <div>
        <Input
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          className="mb-2"
        />
        {logo && (typeof logo === 'string' ? (
          <img src={logo} alt="Logo preview" className="w-32 h-32 object-contain" />
        ) : (
          <img 
            src={URL.createObjectURL(logo)} 
            alt="Logo preview" 
            className="w-32 h-32 object-contain" 
          />
        ))}
      </div>
      <Button 
        onClick={onSave}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Salvando...' : editingCompany ? 'Atualizar Empresa' : 'Cadastrar Empresa'}
      </Button>
    </div>
  );
};

export default CompanyFormFields;