import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BomApetite = () => {
  const { userName } = useParams();
  const location = useLocation();
  const mealType = location.state?.mealType || 'Refeição';
  const [companyLogo, setCompanyLogo] = useState(null);

  useEffect(() => {
    // Aqui você faria uma chamada à API para obter a logo da empresa com base no usuário
    // Por enquanto, vamos simular isso com um setTimeout
    const fetchCompanyLogo = async () => {
      setTimeout(() => {
        setCompanyLogo('/placeholder.svg'); // Substitua isso pela URL real da logo
      }, 1000);
    };

    fetchCompanyLogo();
  }, [userName]);

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          {companyLogo && (
            <img src={companyLogo} alt="Logo da Empresa" className="mx-auto w-32 h-32 object-contain mb-4" />
          )}
          <CardTitle className="text-3xl font-bold text-green-600">Bom Apetite!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl text-center">
            Olá, <span className="font-bold">{userName}</span>!
          </p>
          <p className="text-lg text-center mt-2">
            Aproveite seu(sua) <span className="font-bold">{mealType}</span>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BomApetite;