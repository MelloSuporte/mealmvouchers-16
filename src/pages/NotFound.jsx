import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h1 className="text-4xl font-bold text-gray-900">Página não encontrada</h1>
        <p className="text-gray-600">
          O recurso que você está procurando pode ter sido removido ou está temporariamente indisponível.
        </p>
        <div className="space-y-4">
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full"
          >
            Voltar
          </Button>
          <Button 
            onClick={() => navigate('/')}
            className="w-full"
          >
            Ir para página inicial
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;