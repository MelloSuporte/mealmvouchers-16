import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save } from 'lucide-react';
import ImagePreview from './ImagePreview';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../config/supabase';

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
  const queryClient = useQueryClient();

  const { data: savedBackgrounds } = useQuery({
    queryKey: ['background-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('background_images')
        .select('*')
        .eq('is_active', true);

      if (error) {
        toast.error("Erro ao carregar imagens de fundo");
        throw error;
      }

      return data || [];
    }
  });

  useEffect(() => {
    if (savedBackgrounds) {
      const newPreviews = { ...previews };
      savedBackgrounds.forEach(bg => {
        if (bg.page && bg.image_url) {
          newPreviews[bg.page] = bg.image_url;
        }
      });
      setPreviews(newPreviews);
    }
  }, [savedBackgrounds]);

  const uploadMutation = useMutation({
    mutationFn: async ({ page, file }) => {
      if (!file) return null;

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const { error: updateError } = await supabase
              .from('background_images')
              .update({ is_active: false })
              .eq('page', page);

            if (updateError) throw updateError;

            const { data, error } = await supabase
              .from('background_images')
              .insert([{
                page,
                image_url: reader.result,
                is_active: true
              }])
              .select()
              .single();

            if (error) throw error;
            resolve(data);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.readAsDataURL(file);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['background-images']);
      toast.success('Imagem salva com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao salvar imagem: ${error.message}`);
    }
  });

  const handleFileChange = (page, event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione apenas arquivos de imagem');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('O arquivo deve ter no máximo 5MB');
        return;
      }

      setBackgrounds(prev => ({ ...prev, [page]: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [page]: reader.result }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Erro ao processar arquivo');
      console.error('Erro ao processar arquivo:', error);
    }
  };

  const handleSaveBackground = async (page) => {
    const file = backgrounds[page];
    if (!file) {
      toast.error("Nenhuma imagem selecionada");
      return;
    }

    try {
      setIsLoading(true);
      await uploadMutation.mutateAsync({ page, file });
      setBackgrounds(prev => ({ ...prev, [page]: null }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      {Object.entries({
        voucher: 'Tela Voucher',
        userConfirmation: 'Tela Confirmação de Usuário',
        bomApetite: 'Tela Bom Apetite'
      }).map(([key, label]) => (
        <div key={key} className="space-y-2 bg-white/50 p-4 rounded-lg shadow-sm">
          <Label htmlFor={key} className="text-sm font-medium text-gray-700">{label}</Label>
          <div className="flex flex-col gap-3">
            <Input
              id={key}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(key, e)}
              disabled={isLoading}
              className="h-9 text-sm file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            <Button 
              type="button" 
              onClick={() => handleSaveBackground(key)}
              disabled={isLoading || !backgrounds[key]}
              className="w-fit h-9 text-sm px-4 inline-flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? "Salvando..." : `Salvar ${label}`}
            </Button>
            <ImagePreview imageUrl={previews[key]} label={label} />
          </div>
        </div>
      ))}
    </form>
  );
};

export default BackgroundImageForm;