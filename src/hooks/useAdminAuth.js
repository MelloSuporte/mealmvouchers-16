import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const adminType = localStorage.getItem('adminType');
    
    if (!adminType) {
      toast.error("Acesso não autorizado");
      navigate('/admin-login');
      return;
    }

    setIsAuthenticated(true);
  }, [navigate]);

  return { isAuthenticated };
};