import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';
import { formatCPF } from '../../../utils/formatters';

const UserSearchSection = ({ searchCPF, setSearchCPF, onSearch, isSearching }) => {
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