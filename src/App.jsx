import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Voucher from "./pages/Voucher";
import AdminLogin from "./pages/AdminLogin";
import SelfServices from "./pages/SelfServices";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Menu from "./pages/Menu";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Voucher />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/self-services" element={<SelfServices />} />
          <Route path="/app" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="menu" element={<Menu />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;