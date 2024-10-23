import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';

const UserSearchDialog = ({ isOpen, onClose, onSearch }) => {
  const [searchCPF, setSearchCPF] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchCPF);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pesquisar Usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="CPF do usuário"
            value={searchCPF}
            onChange={(e) => setSearchCPF(e.target.value)}
          />
          <Button type="submit">
            <Search className="mr-2 h-4 w-4" />
            Pesquisar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserSearchDialog;