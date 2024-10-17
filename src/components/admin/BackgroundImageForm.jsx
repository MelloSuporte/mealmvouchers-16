import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const BackgroundImageForm = () => {
  const [voucherBackground, setVoucherBackground] = useState('');
  const [bomApetiteBackground, setBomApetiteBackground] = useState('');

  const handleSaveBackgrounds = () => {
    // Here you would implement the logic to save the background image URLs
    // For now, we'll just log them and show a success toast
    console.log('Saving backgrounds:', { voucherBackground, bomApetiteBackground });
    localStorage.setItem('voucherBackground', voucherBackground);
    localStorage.setItem('bomApetiteBackground', bomApetiteBackground);
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