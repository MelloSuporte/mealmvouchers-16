import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Home, Search, Menu, User } from 'lucide-react';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
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
            <Link to="/search" className="flex flex-col items-center">
              <Search size={24} />
              <span>Buscar</span>
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