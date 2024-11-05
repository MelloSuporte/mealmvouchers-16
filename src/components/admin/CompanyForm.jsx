import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import api from '../../utils/api';
import { validateCNPJ, validateImageFile } from '../../utils/validations';

const CompanyForm = () => {
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [logo, setLogo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await api.get('/companies');
      return response.data;
    }
  });

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

  const validateForm = () => {
    if (!companyName.trim()) {
      throw new Error("Nome da empresa é obrigatório");
    }
    if (companyName.length < 3) {
      throw new Error("Nome da empresa deve ter no mínimo 3 caracteres");
    }
    if (!cnpj) {
      throw new Error("CNPJ é obrigatório");
    }
    validateCNPJ(cnpj);
  };

  const handleSaveCompany = async () => {
    try {
      validateForm();
      setIsSubmitting(true);
      
      if (editingCompany) {
        await api.put(`/companies/${editingCompany.id}`, {
          name: companyName,
          cnpj,
          logo
        });
        toast.success('Empresa atualizada com sucesso!');
      } else {
        await api.post('/companies', {
          name: companyName,
          cnpj,
          logo
        });
        toast.success('Empresa cadastrada com sucesso!');
      }
      
      resetForm();
      refetch();
    } catch (error) {
      toast.error(error.message || "Erro ao salvar empresa");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
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
          onClick={handleSaveCompany}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Salvando..." : (editingCompany ? "Atualizar Empresa" : "Cadastrar Empresa")}
        </Button>
      </form>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Empresas Cadastradas</h2>
        <ScrollArea className="h-[400px] rounded-md border p-4">
          <div className="space-y-4">
            {Array.isArray(companies) && companies.map((company) => (
              <Card key={company.id} className="hover:bg-gray-50">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    {company.logo && (
                      <img 
                        src={company.logo} 
                        alt={company.name} 
                        className="w-12 h-12 object-contain rounded"
                      />
                    )}
                    <div>
                      <h3 className="font-medium">{company.name}</h3>
                      <p className="text-sm text-gray-500">{company.cnpj}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditCompany(company)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default CompanyForm;