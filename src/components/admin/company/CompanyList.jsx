import React from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CompanyList = ({ companies = [], isLoading, onEdit }) => {
  if (isLoading) {
    return <div className="text-sm text-muted-foreground text-center py-4">Carregando empresas...</div>;
  }

  const companyArray = Array.isArray(companies) ? companies : [];

  return (
    <div className="rounded-lg border bg-card shadow-sm max-w-4xl mx-auto mt-8">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs font-medium">Nome</TableHead>
            <TableHead className="text-xs font-medium">CNPJ</TableHead>
            <TableHead className="text-xs font-medium">Data de Cadastro</TableHead>
            <TableHead className="text-xs font-medium">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companyArray.length > 0 ? (
            companyArray.map((company) => (
              <TableRow key={company.id} className="text-sm">
                <TableCell className="py-2">{company.nome}</TableCell>
                <TableCell className="py-2">{company.cnpj}</TableCell>
                <TableCell className="py-2">
                  {company.createdAt && format(new Date(company.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </TableCell>
                <TableCell className="py-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEdit(company)}
                    className="h-7 text-xs px-3"
                  >
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-sm text-muted-foreground">
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