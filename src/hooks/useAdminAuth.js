import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminType = localStorage.getItem('adminType');

    if (!adminToken && adminType !== 'master') {
      toast.error("Sessão expirada. Por favor, faça login novamente.");
      navigate('/admin-login');
      return;
    }
    setIsAuthenticated(true);
  }, [navigate]);

  return { isAuthenticated };
};