import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const BomApetite = () => {
  const navigate = useNavigate();
  const { userName } = useParams();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-blue-600 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          TENHA UM BOM APETITE "{userName.toUpperCase()}"
        </h1>
      </div>
    </div>
  );
};

export default BomApetite;