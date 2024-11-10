import React from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CompanyList = ({ companies = [], isLoading, onEdit }) => {
  if (isLoading) {
    return <div>Carregando empresas...</div>;
  }

  const companyArray = Array.isArray(companies) ? companies : [];

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead>Data de Cadastro</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companyArray.length > 0 ? (
            companyArray.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="font-medium">{company.name}</TableCell>
                <TableCell>{company.cnpj}</TableCell>
                <TableCell>
                  {company.createdAt && format(new Date(company.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEdit(company)}
                  >
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">
                Nenhuma empresa cadastrada
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CompanyList;