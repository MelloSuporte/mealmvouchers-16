import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasPermission } from '../utils/roles';
import { toast } from "sonner";

const ProtectedRoute = ({ children, requiredPermission }) => {
  const userRole = localStorage.getItem('userRole');

  if (!userRole) {
    toast.error("Você precisa fazer login para acessar esta página");
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(userRole, requiredPermission)) {
    toast.error("Você não tem permissão para acessar esta página");
    return <Navigate to="/voucher" replace />;
  }

  return children;
};

export default ProtectedRoute;