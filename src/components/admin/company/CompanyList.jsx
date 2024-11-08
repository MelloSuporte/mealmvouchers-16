import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil } from "lucide-react";

const CompanyList = ({ companies, isLoading, onEdit }) => {
  if (isLoading) {
    return <div>Carregando empresas...</div>;
  }

  return (
    <ScrollArea className="h-[400px] rounded-md border p-4">
      <div className="space-y-4">
        {companies.map((company) => (
          <Card key={company.id} className="bg-white">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-medium">{company.name}</h3>
                <p className="text-sm text-gray-500">{company.cnpj}</p>
              </div>
              <button
                onClick={() => onEdit(company)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default CompanyList;