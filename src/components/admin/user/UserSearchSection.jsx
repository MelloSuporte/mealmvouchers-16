import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';

const UserSearchSection = ({ searchCPF, setSearchCPF, onSearch }) => {
  return (
    <div className="flex space-x-2">
      <Input
        placeholder="Digite o CPF para buscar"
        value={searchCPF}
        onChange={(e) => setSearchCPF(e.target.value)}
      />
      <Button type="button" onClick={onSearch}>
        <Search size={20} />
      </Button>
    </div>
  );
};

export default UserSearchSection;