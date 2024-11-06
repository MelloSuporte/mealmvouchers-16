import React from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import AdminLogin from "./pages/AdminLogin";
import SelfServices from "./pages/SelfServices";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Menu from "./pages/Menu";
import Profile from "./pages/Profile";
import User from "./pages/User";
import Login from "./pages/Login";
import Voucher from "./pages/Voucher";
import BomApetite from "./pages/BomApetite";
import Admin from "./pages/Admin";
import UserConfirmation from "./pages/UserConfirmation";
import AdminManagement from "./pages/AdminManagement";
import { AdminProvider } from "./contexts/AdminContext";

const queryClient = new QueryClient();

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AdminProvider>
          <TooltipProvider>
            <Toaster />
            <Routes>
              <Route path="/" element={<Navigate to="/voucher" />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/voucher" element={<Voucher />} />
              <Route path="/user-confirmation" element={<UserConfirmation />} />
              <Route path="/self-services" element={<SelfServices />} />
              <Route path="/bom-apetite/:userName" element={<BomApetite />} />
              <Route path="/login" element={<Login />} />
              <Route path="/user" element={<User />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/managers" element={<AdminManagement />} />
              <Route path="/app" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="search" element={<Search />} />
                <Route path="menu" element={<Menu />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Routes>
          </TooltipProvider>
        </AdminProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;