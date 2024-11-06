import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

const CompanyList = ({ companies, isLoading, onEdit }) => {
  if (isLoading) {
    return <div>Carregando empresas...</div>;
  }

  return (
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
                  onClick={() => onEdit(company)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CompanyList;