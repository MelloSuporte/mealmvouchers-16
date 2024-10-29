import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import UserSearchDialog from './UserSearchDialog';

const RLSForm = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reason, setReason] = useState('');

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setIsDialogOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) {
      toast.error("Por favor selecione um usuário");
      return;
    }

    if (!reason.trim()) {
      toast.error("Por favor insira um motivo");
      return;
    }

    try {
      const response = await fetch('/api/rls/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          reason: reason
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success("Voucher extra liberado com sucesso!");
      setSelectedUser(null);
      setReason('');
    } catch (error) {
      toast.error(error.message || "Erro ao liberar voucher extra");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsDialogOpen(true)}
          className="w-full"
        >
          {selectedUser ? selectedUser.name : "Selecionar Usuário"}
        </Button>
        <Input
          placeholder="Motivo"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <div className="flex justify-center">
        <Button 
          type="submit"
          className="w-auto px-6"
        >
          Liberar Voucher Extra
        </Button>
      </div>
      <UserSearchDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSelect={handleUserSelect}
      />
    </form>
  );
};

export default RLSForm;