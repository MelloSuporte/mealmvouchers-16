import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Refeitório App</h1>
      </header>
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-gray-200 p-4 text-center">
        <p>&copy; 2024 Refeitório App. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Layout;