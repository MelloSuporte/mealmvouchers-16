import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/config/supabase";
import { Loader2 } from "lucide-react";
import TurnosForm from "@/components/admin/TurnosForm";

const TurnosManager = () => {
  const { data: turnos, isLoading, error } = useQuery({
    queryKey: ['turnos'],
    queryFn: async () => {
      try {
        console.log('Buscando turnos...');
        const { data, error } = await supabase
          .from('turnos')
          .select('*')
          .eq('ativo', true)
          .order('id');

        if (error) {
          console.error('Erro ao buscar turnos:', error);
          toast.error(`Erro ao buscar turnos: ${error.message}`);
          throw error;
        }

        console.log('Turnos encontrados:', data);
        return data || [];
      } catch (erro) {
        console.error('Erro ao buscar turnos:', erro);
        throw erro;
      }
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Erro ao carregar turnos: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gerenciamento de Turnos</h2>
      </div>
      <TurnosForm />
    </div>
  );
};

export default TurnosManager;