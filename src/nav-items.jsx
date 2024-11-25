import { HomeIcon, ImageIcon } from "lucide-react";
import Index from "./pages/Index.jsx";
import BackgroundImages from "./pages/BackgroundImages.jsx";

export const navItems = [
  {
    title: "Início",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Imagens de Fundo",
    to: "/imagens-fundo",
    icon: <ImageIcon className="h-4 w-4" />,
    page: <BackgroundImages />,
  },
];