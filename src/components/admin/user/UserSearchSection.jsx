import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const UserSearchSection = ({ searchCPF, setSearchCPF, onSearch, isSearching }) => {
  return (
    <div className="flex gap-2 max-w-md mb-4">
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
        className="h-9 whitespace-nowrap"
      >
        <Search size={16} className="mr-2" />
        {isSearching ? 'Buscando...' : 'Buscar'}
      </Button>
    </div>
  );
};

export default UserSearchSection;