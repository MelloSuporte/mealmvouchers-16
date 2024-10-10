import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-blue-600 flex flex-col p-4 relative">
      <div className="absolute top-4 right-4">
        <Link to="/admin-login">
          <Button className="bg-white text-blue-600 hover:bg-blue-100">
            Login
          </Button>
        </Link>
      </div>
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Bem-vindo ao Refeitório</h1>
          <p className="text-xl mb-8">Escolha uma opção para continuar</p>
          <div className="space-y-4">
            <Link to="/voucher">
              <Button className="w-full bg-white text-blue-600 hover:bg-blue-100">
                Entrar com Voucher
              </Button>
            </Link>
            <Link to="/self-services">
              <Button className="w-full bg-white text-blue-600 hover:bg-blue-100">
                Self-Service
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;