import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from '../../utils/api';

// Constantes de segurança
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
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

  // Função para verificar se houve alteração recente
  const checkRecentModification = () => {
    const lastMod = localStorage.getItem('lastImageModification');
    if (lastMod) {
      const timeDiff = Date.now() - parseInt(lastMod);
      // Previne modificações em menos de 5 minutos
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
      const response = await api.get('/background-images');
      const images = response.data;
      
      // Validação adicional dos dados recebidos
      if (!Array.isArray(images)) {
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

  const validateImage = (file) => {
    // Verifica se é um arquivo válido
    if (!file || !(file instanceof File)) {
      toast.error("Arquivo inválido");
      return false;
    }

    // Verifica o tipo do arquivo
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Formato de arquivo não permitido. Use: JPG, PNG, GIF ou WEBP");
      return false;
    }

    // Verifica o tamanho do arquivo
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Arquivo muito grande. Limite máximo: 5MB");
      return false;
    }

    // Verifica a extensão do arquivo
    const extension = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      toast.error("Extensão de arquivo não permitida");
      return false;
    }

    return true;
  };

  const handleFileChange = (page, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validações de segurança
    if (!ALLOWED_PAGES.includes(page)) {
      toast.error("Página inválida");
      event.target.value = '';
      return;
    }

    if (!validateImage(file)) {
      event.target.value = '';
      return;
    }

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
  };

  const handleSaveBackgrounds = async () => {
    if (!checkRecentModification()) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Validação adicional antes do envio
      const hasChanges = Object.values(backgrounds).some(Boolean);
      if (!hasChanges) {
        toast.error("Nenhuma alteração para salvar");
        return;
      }

      const formData = new FormData();
      let validFiles = true;

      Object.entries(backgrounds).forEach(([key, value]) => {
        if (value) {
          if (!validateImage(value)) {
            validFiles = false;
            return;
          }
          formData.append(key, value);
        }
      });

      if (!validFiles) {
        toast.error("Arquivos inválidos detectados");
        return;
      }

      const response = await api.post('/background-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        localStorage.setItem('lastImageModification', Date.now().toString());
        setLastModified(new Date());
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
        disabled={isLoading || !Object.values(backgrounds).some(Boolean) || !checkRecentModification()}
      >
        {isLoading ? "Salvando..." : "Salvar Imagens de Fundo"}
      </Button>
    </form>
  );
};

export default BackgroundImageForm;