import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';
import { formatCPF } from '../../utils/formatters';

const UserSearchDialog = ({ isOpen, onClose, onSearch }) => {
  const [searchCPF, setSearchCPF] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchCPF);
    onClose();
  };

  const handleCPFChange = (e) => {
    const formattedCPF = formatCPF(e.target.value);
    setSearchCPF(formattedCPF);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pesquisar Usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="000.000.000-00"
            value={searchCPF}
            onChange={handleCPFChange}
            maxLength={14}
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