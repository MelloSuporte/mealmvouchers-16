import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (voucher) => {
    try {
      // Aqui você implementaria a verificação real do voucher no banco de dados
      const isValid = voucher && voucher.length === 4;
      
      if (isValid) {
        setUser({ voucher });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const adminLogin = async (password) => {
    try {
      // Aqui você implementaria a verificação real da senha de admin no banco de dados
      const isValid = password === process.env.ADMIN_PASSWORD;
      
      if (isValid) {
        setUser({ isAdmin: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro no login admin:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};