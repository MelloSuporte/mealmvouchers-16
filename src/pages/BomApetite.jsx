import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from "sonner";

const BomApetite = () => {
  const { userName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(5);
  const mealType = location.state?.mealType || 'Refeição';
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    const savedBackground = localStorage.getItem('bomApetiteBackground');
    if (savedBackground) {
      setBackgroundImage(savedBackground);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCount) => prevCount - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      toast.success("Redirecionando para a página de voucher...");
      navigate('/voucher');
    }
  }, [countdown, navigate]);

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen bg-blue-600 p-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">Bom Apetite!</h1>
        <p className="text-xl mb-4">Olá, {userName}!</p>
        <p className="text-lg mb-6">Aproveite seu(sua) {mealType}.</p>
        <p className="text-md">Retornando à página de voucher em {countdown} segundos...</p>
      </div>
    </div>
  );
};

export default BomApetite;