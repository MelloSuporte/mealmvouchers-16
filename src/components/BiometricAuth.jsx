import React, { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const BiometricAuth = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleBiometricAuth = async () => {
    try {
      setIsLoading(true);

      // Verificar se o navegador suporta WebAuthn
      if (!window.PublicKeyCredential) {
        toast.error("Seu navegador não suporta autenticação biométrica");
        return;
      }

      // Verificar se o dispositivo tem sensor biométrico
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        toast.error("Seu dispositivo não possui sensor biométrico");
        return;
      }

      // Simular a obtenção de dados do servidor
      const mockOptions = {
        challenge: 'mockChallenge123',
        rpId: window.location.hostname,
        allowCredentials: [],
        userVerification: 'preferred',
        timeout: 60000,
      };

      // Iniciar autenticação biométrica
      const authResult = await startAuthentication(mockOptions);
      
      // Em um ambiente real, você enviaria o resultado para o servidor validar
      console.log('Autenticação biométrica bem-sucedida:', authResult);
      
      toast.success("Autenticação biométrica realizada com sucesso!");
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error('Erro na autenticação biométrica:', error);
      toast.error("Falha na autenticação biométrica. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleBiometricAuth}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? "Verificando..." : "Usar Biometria"}
    </Button>
  );
};

export default BiometricAuth;