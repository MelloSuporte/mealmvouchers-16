import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Voucher from './pages/Voucher';
import UserConfirmation from './pages/UserConfirmation';
import BomApetite from './pages/BomApetite';
import SelfServices from './pages/SelfServices';
import Admin from './pages/Admin';
import BackgroundImages from './pages/BackgroundImages';
import { Toaster } from './components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';

function App() {
  return (
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
  );
}

export default App;