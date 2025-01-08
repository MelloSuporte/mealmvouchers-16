import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { AdminProvider } from './contexts/AdminContext';

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
      <AdminProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/voucher" replace />} />
            <Route path="/voucher" element={<Voucher />} />
            <Route path="/refeitorio" element={<Home />} />
            <Route path="/user-confirmation" element={<UserConfirmation />} />
            <Route path="/bom-apetite" element={<BomApetite />} />
            <Route path="/self-services" element={<SelfServices />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/background-images" element={<BackgroundImages />} />
          </Routes>
          <Toaster />
          <SonnerToaster position="top-right" />
        </Router>
      </AdminProvider>
    </QueryClientProvider>
  );
}

export default App;