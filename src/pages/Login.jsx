import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ROLES } from '../utils/roles';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulação de autenticação com roles
    let userRole;
    if (email.includes('admin')) {
      userRole = ROLES.ADMIN;
    } else if (email.includes('supervisor')) {
      userRole = ROLES.SUPERVISOR;
    } else if (email.includes('operator')) {
      userRole = ROLES.OPERATOR;
    } else {
      userRole = ROLES.USER;
    }

    // Armazenar informações do usuário
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('userEmail', email);

    // Redirecionar baseado na role
    switch (userRole) {
      case ROLES.ADMIN:
        navigate('/admin');
        break;
      case ROLES.SUPERVISOR:
        navigate('/app/reports');
        break;
      case ROLES.OPERATOR:
        navigate('/voucher');
        break;
      default:
        navigate('/user');
    }

    toast.success(`Login realizado com sucesso como ${userRole}`);
  };

  return (
    <div className="container mx-auto p-4 h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;