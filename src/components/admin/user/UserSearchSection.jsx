import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';

const UserSearchSection = ({ searchCPF, setSearchCPF, onSearch, isSearching }) => {
  const formatCPF = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
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
      <Button 
        type="button" 
        onClick={onSearch}
        disabled={isSearching}
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default UserSearchSection;