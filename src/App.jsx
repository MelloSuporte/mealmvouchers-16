import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/voucher" />} />
            <Route path="/voucher" element={<Voucher />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            
            {/* Rotas protegidas que requerem autenticação de usuário */}
            <Route path="/user-confirmation" element={
              <ProtectedRoute>
                <UserConfirmation />
              </ProtectedRoute>
            } />
            <Route path="/self-services" element={
              <ProtectedRoute>
                <SelfServices />
              </ProtectedRoute>
            } />
            <Route path="/bom-apetite/:userName" element={
              <ProtectedRoute>
                <BomApetite />
              </ProtectedRoute>
            } />
            <Route path="/user" element={
              <ProtectedRoute>
                <User />
              </ProtectedRoute>
            } />
            
            {/* Rotas protegidas que requerem autenticação de admin */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <Admin />
              </ProtectedRoute>
            } />
            
            {/* Rotas do layout principal protegidas */}
            <Route path="/app" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Home />} />
              <Route path="search" element={<Search />} />
              <Route path="menu" element={<Menu />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;