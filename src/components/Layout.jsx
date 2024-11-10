import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Home, Menu, User } from 'lucide-react';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Refeitório</h1>
        <User size={24} />
      </header>
      <main className="flex-grow">
        <Outlet />
      </main>
      <nav className="bg-blue-600 text-white p-4">
        <ul className="flex justify-around">
          <li>
            <Link to="/" className="flex flex-col items-center">
              <Home size={24} />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link to="/menu" className="flex flex-col items-center">
              <Menu size={24} />
              <span>Cardápio</span>
            </Link>
          </li>
          <li>
            <Link to="/profile" className="flex flex-col items-center">
              <User size={24} />
              <span>Perfil</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Layout;