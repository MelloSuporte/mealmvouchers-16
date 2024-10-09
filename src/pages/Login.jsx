import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Login = () => {
  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold">Login</h2>
        </div>
        <form className="mt-8 space-y-6">
          <Input type="text" placeholder="Username" className="w-full" />
          <Input type="password" placeholder="Password" className="w-full" />
          <Button className="w-full bg-white text-blue-600 hover:bg-blue-100">Login</Button>
        </form>
      </div>
    </div>
  );
};

export default Login;