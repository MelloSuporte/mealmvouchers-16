import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './pages/Home';
import Voucher from './pages/Voucher';
import UserConfirmation from './pages/UserConfirmation';
import BomApetite from './pages/BomApetite';
import SelfServices from './pages/SelfServices';
import Admin from './pages/Admin';
import BackgroundImages from './pages/BackgroundImages';
import { Toaster } from './components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';

// Criar uma instância do QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/voucher" element={<Voucher />} />
          <Route path="/user-confirmation" element={<UserConfirmation />} />
          <Route path="/bom-apetite" element={<BomApetite />} />
          <Route path="/self-services" element={<SelfServices />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/background-images" element={<BackgroundImages />} />
        </Routes>
        <Toaster />
        <SonnerToaster position="top-right" />
      </Router>
    </QueryClientProvider>
  );
}

export default App;