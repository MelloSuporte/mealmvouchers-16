import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

const AdminLoginDialog = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (password === '0001000') {
      onClose();
      navigate('/admin');
      toast.success("Login bem-sucedido!");
    } else {
      toast.error("Senha incorreta. Tente novamente.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Login de Administrador</DialogTitle>
        </DialogHeader>
        <Input
          type="password"
          placeholder="Digite a senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <DialogFooter>
          <Button onClick={handleLogin}>Entrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminLoginDialog;