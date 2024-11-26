import React from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminProvider } from "./contexts/AdminContext";
import SelfServices from "./pages/SelfServices";
import User from "./pages/User";
import Login from "./pages/Login";
import Voucher from "./pages/Voucher";
import BomApetite from "./pages/BomApetite";
import Admin from "./pages/Admin";
import Turnos from "./pages/Turnos";
import UserConfirmation from "./pages/UserConfirmation";
import AdminManagement from "./pages/AdminManagement";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnMount: true,
    },
  },
});

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AdminProvider>
            <BrowserRouter>
              <Toaster 
                position="top-right"
                expand={true}
                visibleToasts={6}
                toastOptions={{
                  success: { 
                    position: "top-right",
                    className: "bg-green-500 text-white border-green-600",
                    style: {
                      top: '20px',
                      right: '20px'
                    }
                  },
                  error: { 
                    position: "bottom-right",
                    className: "bg-red-500 text-white border-red-600",
                    duration: 4000,
                    style: {
                      bottom: '20px',
                      right: '20px',
                      backgroundColor: 'rgb(239 68 68)',
                      color: 'white',
                      border: '1px solid rgb(220 38 38)'
                    }
                  },
                  info: { position: "top-right" },
                  warning: { position: "top-right" },
                }}
                richColors
                closeButton
              />
              <Routes>
                <Route path="/" element={<Navigate to="/voucher" replace />} />
                <Route path="/voucher" element={<Voucher />} />
                <Route path="/user-confirmation" element={<UserConfirmation />} />
                <Route path="/self-services" element={<SelfServices />} />
                <Route path="/bom-apetite/:userName" element={<BomApetite />} />
                <Route path="/login" element={<Login />} />
                <Route path="/user" element={<User />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/turnos" element={<Turnos />} />
                <Route path="/admin/managers" element={<AdminManagement />} />
              </Routes>
            </BrowserRouter>
          </AdminProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;