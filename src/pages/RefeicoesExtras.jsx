import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExtraMealForm from '../components/admin/extra-meals/ExtraMealForm';
import ExtraMealReport from '../components/admin/extra-meals/ExtraMealReport';
import { FileText, FilePlus, Utensils } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const RefeicoesExtras = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Refeições Extras</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/refeicao')}
            className="hover:bg-slate-100"
          >
            <Utensils className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/relatorios')}
            className="hover:bg-slate-100"
          >
            <FileText className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="register" className="space-y-4">
        <TabsList>
          <TabsTrigger value="register">
            <div className="flex items-center gap-1">
              <FilePlus className="h-4 w-4" />
              Cadastrar
            </div>
          </TabsTrigger>
          <TabsTrigger value="report">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Relatórios
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="register">
          <div className="space-y-6">
            <ExtraMealForm />
          </div>
        </TabsContent>
        
        <TabsContent value="report">
          <ExtraMealReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RefeicoesExtras;