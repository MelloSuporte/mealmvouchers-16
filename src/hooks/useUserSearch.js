import { useState } from 'react';
import { supabase } from '../config/supabase';
import { toast } from "sonner";

export const useUserSearch = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  const searchUser = async (cpf) => {
    if (!cpf || cpf.length < 11) return;

    try {
      const cleanCPF = cpf.replace(/\D/g, '');
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('cpf', cleanCPF)
        .single();

      if (error) throw error;

      if (data) {
        setSelectedUser(data);
        toast.success('Usuário encontrado!');
      } else {
        toast.error('Usuário não encontrado');
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      toast.error('Erro ao buscar usuário');
      setSelectedUser(null);
    }
  };

  return {
    selectedUser,
    setSelectedUser,
    searchUser
  };
};