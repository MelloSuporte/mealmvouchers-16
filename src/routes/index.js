import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import ErrorPage from "@/pages/ErrorPage";
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import AdminPage from "@/pages/AdminPage";
import UsersPage from "@/pages/UsersPage";
import CompaniesPage from "@/pages/CompaniesPage";
import VouchersPage from "@/pages/VouchersPage";
import ReportsPage from "@/pages/ReportsPage";
import ReportsT from '@/pages/ReportsT';
import BomApetitePage from "@/pages/BomApetitePage";
import ValidatePage from "@/pages/ValidatePage";
import SettingsPage from "@/pages/SettingsPage";
import ProfilePage from "@/pages/ProfilePage";

const routes = [
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/admin",
        element: <AdminPage />,
      },
      {
        path: "/admin/users",
        element: <UsersPage />,
      },
      {
        path: "/admin/companies",
        element: <CompaniesPage />,
      },
      {
        path: "/admin/vouchers",
        element: <VouchersPage />,
      },
      {
        path: "/admin/reports",
        element: <ReportsPage />,
      },
      {
        path: '/admin/reports-t',
        element: <ReportsT />,
      },
      {
        path: "/bom-apetite",
        element: <BomApetitePage />,
      },
      {
        path: "/validate",
        element: <ValidatePage />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
