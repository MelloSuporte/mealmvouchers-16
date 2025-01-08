import { useEffect, useState } from 'react';
import { toast } from "sonner";

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    
    if (!adminToken) {
      setIsAuthenticated(false);
      return;
    }

    setIsAuthenticated(true);
  }, []);

  return { isAuthenticated };
};