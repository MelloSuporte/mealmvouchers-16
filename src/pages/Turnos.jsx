import React from 'react';
import TurnosForm from '@/components/admin/TurnosForm';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

const Turnos = () => {
  const { isMasterAdmin } = useAdmin();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isMasterAdmin) {
      toast.error("Você não tem permissão para acessar esta funcionalidade");
      navigate('/admin');
      return;
    }
  }, [isMasterAdmin, navigate]);

  if (!isMasterAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <TurnosForm />
    </div>
  );
};

export default Turnos;