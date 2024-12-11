import React from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit2 } from 'lucide-react';

const CompanyList = ({ companies = [], isLoading, onEdit }) => {
  if (isLoading) {
    return <div className="text-sm text-muted-foreground text-center py-4">Carregando empresas...</div>;
  }

  const companyArray = Array.isArray(companies) ? companies : [];

  return (
    <div className="rounded-lg border bg-card shadow-sm max-w-4xl mx-auto mt-6">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-xs font-semibold text-muted-foreground h-9 px-2">Nome</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground h-9 px-2">CNPJ</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground h-9 px-2">Data de Cadastro</TableHead>
            <TableHead className="text-xs font-semibold text-muted-foreground h-9 px-2 w-20">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companyArray.length > 0 ? (
            companyArray.map((company) => (
              <TableRow key={company.id} className="text-xs hover:bg-muted/50">
                <TableCell className="py-2 px-2">{company.nome}</TableCell>
                <TableCell className="py-2 px-2">{company.cnpj}</TableCell>
                <TableCell className="py-2 px-2">
                  {company.createdAt && format(new Date(company.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </TableCell>
                <TableCell className="py-2 px-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEdit(company)}
                    className="h-7 w-7 p-0"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-xs text-muted-foreground">
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