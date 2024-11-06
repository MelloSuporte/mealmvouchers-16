import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';

const UserSearchSection = ({ searchCPF, setSearchCPF, onSearch }) => {
  return (
    <div className="flex gap-2">
      <Input 
        placeholder="Pesquisar por CPF" 
        value={searchCPF}
        onChange={(e) => setSearchCPF(e.target.value)}
      />
      <Button type="button" onClick={onSearch}>
        <Search size={20} className="mr-2" />
        Buscar
      </Button>
    </div>
  );
};

export default UserSearchSection;