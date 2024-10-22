import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const BackgroundImageForm = () => {
  const [voucherBackground, setVoucherBackground] = useState('');
  const [userConfirmationBackground, setUserConfirmationBackground] = useState('');
  const [bomApetiteBackground, setBomApetiteBackground] = useState('');

  useEffect(() => {
    setVoucherBackground(localStorage.getItem('voucherBackground') || '');
    setUserConfirmationBackground(localStorage.getItem('userConfirmationBackground') || '');
    setBomApetiteBackground(localStorage.getItem('bomApetiteBackground') || '');
  }, []);

  const handleSaveBackgrounds = () => {
    const timestamp = new Date().getTime();
    localStorage.setItem('voucherBackground', `${voucherBackground}?v=${timestamp}`);
    localStorage.setItem('userConfirmationBackground', `${userConfirmationBackground}?v=${timestamp}`);
    localStorage.setItem('bomApetiteBackground', `${bomApetiteBackground}?v=${timestamp}`);
    toast.success("Imagens de fundo atualizadas com sucesso!");
  };

  return (
    <form className="space-y-4">
      <div>
        <Label htmlFor="voucher-bg">Imagem de fundo para tela Voucher</Label>
        <Input
          id="voucher-bg"
          type="text"
          placeholder="URL da imagem"
          value={voucherBackground}
          onChange={(e) => setVoucherBackground(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="user-confirmation-bg">Imagem de fundo para tela UserConfirmation</Label>
        <Input
          id="user-confirmation-bg"
          type="text"
          placeholder="URL da imagem"
          value={userConfirmationBackground}
          onChange={(e) => setUserConfirmationBackground(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="bom-apetite-bg">Imagem de fundo para tela Bom Apetite</Label>
        <Input
          id="bom-apetite-bg"
          type="text"
          placeholder="URL da imagem"
          value={bomApetiteBackground}
          onChange={(e) => setBomApetiteBackground(e.target.value)}
        />
      </div>
      <Button type="button" onClick={handleSaveBackgrounds}>Salvar Imagens de Fundo</Button>
    </form>
  );
};

export default BackgroundImageForm;
