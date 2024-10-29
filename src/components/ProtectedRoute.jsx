import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/voucher" replace />;
  }

  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/voucher" replace />;
  }

  return children;
};