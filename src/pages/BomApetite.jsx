import React, { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const BomApetite = () => {
  const navigate = useNavigate();
  const { userName } = useParams();
  const location = useLocation();
  const mealType = location.state?.mealType || 'Refeição';

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/voucher');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-blue-600 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          TENHA UM BOM APETITE "{userName.toUpperCase()}"
        </h1>
        <p className="text-2xl text-white">
          Sua refeição selecionada: {mealType}
        </p>
      </div>
    </div>
  );
};

export default BomApetite;