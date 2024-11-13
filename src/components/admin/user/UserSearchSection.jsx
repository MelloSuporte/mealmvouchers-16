import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';

const UserSearchSection = ({ searchCPF, setSearchCPF, onSearch }) => {
  const formatCPF = (value) => {
    const cpf = value.replace(/\D/g, '');
    if (cpf.length <= 11) {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return value;
  };

  const handleCPFChange = (e) => {
    const formattedCPF = formatCPF(e.target.value);
    setSearchCPF(formattedCPF);
  };

  return (
    <div className="flex space-x-2">
      <Input
        placeholder="Digite o CPF para buscar (000.000.000-00)"
        value={searchCPF}
        onChange={handleCPFChange}
        maxLength={14}
      />
      <Button type="button" onClick={onSearch}>
        <Search size={20} />
      </Button>
    </div>
  );
};

export default UserSearchSection;