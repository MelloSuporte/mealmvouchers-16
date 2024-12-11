import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { formatCPF } from '../../../utils/formatters';

const UserSearchSection = ({ searchCPF, setSearchCPF, onSearch, isSearching }) => {
  const handleCPFChange = (e) => {
    const formattedCPF = formatCPF(e.target.value);
    setSearchCPF(formattedCPF);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 mb-4 max-w-2xl mx-auto">
      <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Buscar Usuário</h2>
      <div className="flex gap-2">
        <Input
          placeholder="000.000.000-00"
          value={searchCPF}
          onChange={handleCPFChange}
          maxLength={14}
          className="h-8 text-sm"
        />
        <Button 
          onClick={onSearch} 
          disabled={isSearching}
          size="sm"
          className="h-8 whitespace-nowrap hover:bg-primary/90 text-sm px-3"
        >
          <Search size={14} className="mr-1.5" />
          {isSearching ? 'Buscando...' : 'Buscar'}
        </Button>
      </div>
    </div>
  );
};

export default UserSearchSection;