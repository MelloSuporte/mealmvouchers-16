import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AdminForm from './AdminForm';
import AdminTable from './AdminTable';
import { supabase } from '../../../config/supabase';
import { useState } from 'react';
import logger from '../../../config/logger';

const AdminList = () => {
  const [searchCPF, setSearchCPF] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: admins, isLoading } = useQuery({
    queryKey: ['admins', searchCPF],
    queryFn: async () => {
      try {
        logger.info('Buscando gerentes...');
        let query = supabase
          .from('admin_users')
          .select(`
            *,
            empresas (
              id,
              nome
            )
          `)
          .order('nome');

        if (searchCPF) {
          const cleanCPF = searchCPF.replace(/\D/g, '');
          query = query.eq('cpf', cleanCPF);
        }

        const { data, error } = await query;

        if (error) {
          logger.error('Erro ao buscar gerentes:', error);
          toast.error('Erro ao buscar gerentes: ' + error.message);
          throw error;
        }

        logger.info(`${data?.length || 0} gerentes encontrados`);
        return data || [];
      } catch (error) {
        logger.error('Erro na busca de gerentes:', error);
        toast.error('Erro ao buscar gerentes');
        throw error;
      }
    },
    enabled: true
  });

  const handleSearch = () => {
    if (!searchCPF) {
      toast.error('Por favor, informe um CPF para buscar');
      return;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Input
          placeholder="CPF do Gerente"
          value={searchCPF}
          onChange={(e) => setSearchCPF(e.target.value)}
        />
        <Button onClick={handleSearch}>Buscar</Button>
        <Button variant="outline" onClick={() => setShowForm(true)}>
          Novo Gerente
        </Button>
      </div>

      {showForm && (
        <AdminForm
          onClose={() => setShowForm(false)}
        />
      )}

      <AdminTable admins={admins || []} isLoading={isLoading} />
    </div>
  );
};

export default AdminList;