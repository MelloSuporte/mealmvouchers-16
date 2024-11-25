import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from '../../utils/api';
import { validateImage } from '../../utils/imageHandling';
import ImagePreview from './ImagePreview';
import { Save } from 'lucide-react';

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
      if (timeDiff < 300000) { // 5 minutos
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
      const response = await api.get('/api/imagens-fundo');
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Erro ao carregar imagens');
      }

      const images = response.data.data;
      
      if (!Array.isArray(images)) {
        console.error('Formato de dados inválido:', images);
        throw new Error('Formato de dados inválido');
      }

      const validImages = images.filter(img => 
        ALLOWED_PAGES.includes(img.page) && 
        typeof img.image_url === 'string' &&
        img.image_url.startsWith('data:image/')
      );
      
      setPreviews(prevPreviews => ({
        ...prevPreviews,
        voucher: validImages.find(img => img.page === 'voucher')?.image_url || '',
        userConfirmation: validImages.find(img => img.page === 'userConfirmation')?.image_url || '',
        bomApetite: validImages.find(img => img.page === 'bomApetite')?.image_url || ''
      }));
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
      toast.error(error.message || "Erro ao carregar imagens de fundo");
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

  const handleSaveBackground = async (page) => {
    if (!checkRecentModification()) return;
    
    try {
      setIsLoading(true);
      
      const file = backgrounds[page];
      if (!file) {
        toast.error("Nenhuma imagem selecionada");
        return;
      }

      const formData = new FormData();
      formData.append('page', page);
      formData.append('image', file);

      const response = await api.post('/api/imagens-fundo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Erro ao salvar imagem');
      }

      localStorage.setItem('lastImageModification', Date.now().toString());
      setLastModified(new Date());
      toast.success(`Imagem de fundo para ${page} atualizada com sucesso!`);
      
      setBackgrounds(prev => ({ ...prev, [page]: null }));
      await loadSavedBackgrounds();
    } catch (error) {
      console.error('Erro completo:', error);
      toast.error(`Erro ao salvar imagem de fundo: ${error.message}`);
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
          <div className="flex flex-col gap-4">
            <Input
              id={key}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(key, e)}
              disabled={isLoading || !checkRecentModification()}
            />
            <Button 
              type="button" 
              onClick={() => handleSaveBackground(key)}
              disabled={isLoading || !backgrounds[key] || !checkRecentModification()}
              className="w-fit"
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Salvando..." : `Salvar Imagem ${label}`}
            </Button>
            <ImagePreview imageUrl={previews[key]} label={label} />
          </div>
        </div>
      ))}
    </form>
  );
};

export default BackgroundImageForm;