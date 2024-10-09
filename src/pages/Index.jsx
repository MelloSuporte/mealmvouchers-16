import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-100 relative">
      <div className="absolute top-0 right-0 w-full h-1/3 bg-blue-600 rounded-bl-[30%]"></div>
      
      <div className="relative z-10 p-4">
        <div className="flex justify-end">
          <Link to="/user">
            <Button className="bg-white text-blue-600 hover:bg-blue-100">
              Login
            </Button>
          </Link>
        </div>
        
        <div className="mt-16 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Bem-vindo ao Refeitório</h1>
          <p className="text-xl text-white mb-8">Escolha sua refeição e aproveite!</p>
        </div>
        
        {/* Add your main content here */}
      </div>
    </div>
  );
};

export default Index;