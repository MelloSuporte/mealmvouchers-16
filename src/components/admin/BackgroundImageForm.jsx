import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from '../../utils/api';

const BackgroundImageForm = () => {
  const [backgrounds, setBackgrounds] = useState({
    voucher: null,
    userConfirmation: null,
    bomApetite: null
  });

  const [previews, setPreviews] = useState({
    voucher: '',
    userConfirmation: '',
    bomApetite: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSavedBackgrounds();
  }, []);

  const loadSavedBackgrounds = async () => {
    try {
      const response = await api.get('/background-images');
      const images = response.data;
      
      setPreviews({
        voucher: images.find(img => img.page === 'voucher')?.image_url || '',
        userConfirmation: images.find(img => img.page === 'userConfirmation')?.image_url || '',
        bomApetite: images.find(img => img.page === 'bomApetite')?.image_url || ''
      });
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
      toast.error("Erro ao carregar imagens de fundo");
    }
  };

  const handleFileChange = (page, event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Limite máximo: 5MB");
        return;
      }

      setBackgrounds(prev => ({ ...prev, [page]: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [page]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBackgrounds = async () => {
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      Object.entries(backgrounds).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });
      
      const response = await api.post('/background-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success("Imagens de fundo atualizadas com sucesso!");
        loadSavedBackgrounds();
      }
    } catch (error) {
      console.error('Erro ao salvar imagens:', error);
      toast.error("Erro ao salvar imagens de fundo. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      {Object.entries({
        voucher: 'Tela Voucher',
        userConfirmation: 'Tela Confirmação de Usuário',
        bomApetite: 'Tela Bom Apetite'
      }).map(([key, label]) => (
        <div key={key} className="space-y-2">
          <Label htmlFor={key}>{label}</Label>
          <Input
            id={key}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(key, e)}
            disabled={isLoading}
          />
          {previews[key] && (
            <div className="mt-2">
              <img
                src={previews[key]}
                alt={`Preview ${label}`}
                className="max-w-xs h-auto rounded-lg shadow-md"
              />
            </div>
          )}
        </div>
      ))}
      
      <Button 
        type="button" 
        onClick={handleSaveBackgrounds}
        disabled={isLoading || !Object.values(backgrounds).some(Boolean)}
      >
        {isLoading ? "Salvando..." : "Salvar Imagens de Fundo"}
      </Button>
    </form>
  );
};

export default BackgroundImageForm;