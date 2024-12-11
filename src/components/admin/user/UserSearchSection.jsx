import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const UserSearchSection = ({ searchCPF, setSearchCPF, onSearch, isSearching }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Buscar Usuário</h2>
      <div className="flex gap-2 max-w-md">
        <Input
          placeholder="Digite o CPF para buscar"
          value={searchCPF}
          onChange={(e) => setSearchCPF(e.target.value)}
          className="h-9"
        />
        <Button 
          onClick={onSearch} 
          disabled={isSearching}
          size="sm"
          className="h-9 whitespace-nowrap hover:bg-primary/90"
        >
          <Search size={16} className="mr-2" />
          {isSearching ? 'Buscando...' : 'Buscar'}
        </Button>
      </div>
    </div>
  );
};

export default UserSearchSection;