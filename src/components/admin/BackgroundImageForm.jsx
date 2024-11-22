import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from '../../utils/api';
import { validateImage } from '../../utils/imageHandling';
import ImagePreview from './ImagePreview';

const ALLOWED_PAGES = ['voucher', 'userConfirmation', 'bomApetite'];

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
  const [lastModified, setLastModified] = useState(null);

  const checkRecentModification = () => {
    const lastMod = localStorage.getItem('lastImageModification');
    if (lastMod) {
      const timeDiff = Date.now() - parseInt(lastMod);
      if (timeDiff < 300000) {
        toast.error("Aguarde 5 minutos antes de fazer novas alterações");
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    loadSavedBackgrounds();
    const lastMod = localStorage.getItem('lastImageModification');
    if (lastMod) setLastModified(new Date(parseInt(lastMod)));
  }, []);

  const loadSavedBackgrounds = async () => {
    try {
      const response = await api.get('/imagens-fundo');
      if (!response.data) {
        throw new Error('Dados inválidos recebidos do servidor');
      }

      const images = response.data;
      
      if (!Array.isArray(images)) {
        console.error('Formato de dados inválido:', images);
        throw new Error('Formato de dados inválido');
      }

      const validImages = images.filter(img => 
        ALLOWED_PAGES.includes(img.page) && 
        typeof img.image_url === 'string' &&
        img.image_url.startsWith('data:image/')
      );
      
      setPreviews({
        voucher: validImages.find(img => img.page === 'voucher')?.image_url || '',
        userConfirmation: validImages.find(img => img.page === 'userConfirmation')?.image_url || '',
        bomApetite: validImages.find(img => img.page === 'bomApetite')?.image_url || ''
      });
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
      toast.error("Erro ao carregar imagens de fundo");
    }
  };

  const handleFileChange = (page, event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!ALLOWED_PAGES.includes(page)) {
      toast.error("Página inválida");
      event.target.value = '';
      return;
    }

    try {
      validateImage(file);
      setBackgrounds(prev => ({ ...prev, [page]: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [page]: reader.result }));
      };
      reader.onerror = () => {
        toast.error("Erro ao ler o arquivo. Tente novamente.");
        event.target.value = '';
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error(error.message);
      event.target.value = '';
    }
  };

  const handleSaveBackgrounds = async () => {
    if (!checkRecentModification()) return;

    try {
      setIsLoading(true);
      
      const hasChanges = Object.values(backgrounds).some(Boolean);
      if (!hasChanges) {
        toast.error("Nenhuma alteração para salvar");
        return;
      }

      const formData = new FormData();
      Object.entries(backgrounds).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      const response = await api.post('/imagens-fundo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (!response.data || response.data.success !== true) {
        throw new Error(response.data?.error || 'Erro ao processar resposta do servidor');
      }

      localStorage.setItem('lastImageModification', Date.now().toString());
      setLastModified(new Date());
      toast.success("Imagens de fundo atualizadas com sucesso!");
      await loadSavedBackgrounds();
      setBackgrounds({ voucher: null, userConfirmation: null, bomApetite: null });
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      toast.error(`Erro ao salvar imagens de fundo: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      {lastModified && (
        <div className="text-sm text-gray-500">
          Última modificação: {lastModified.toLocaleString()}
        </div>
      )}
      
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
            disabled={isLoading || !checkRecentModification()}
          />
          <ImagePreview imageUrl={previews[key]} label={label} />
        </div>
      ))}
      
      <Button 
        type="button" 
        onClick={handleSaveBackgrounds}
        disabled={isLoading || !Object.values(backgrounds).some(Boolean) || !checkRecentModification()}
      >
        {isLoading ? "Salvando..." : "Salvar Imagens de Fundo"}
      </Button>
    </form>
  );
};

export default BackgroundImageForm;