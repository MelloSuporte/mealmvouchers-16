import { supabase } from '../config/supabase';
import { toast } from "sonner";

export const uploadLogo = async (file) => {
  try {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('logos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    toast.error('Erro ao fazer upload do logo: ' + error.message);
    throw error;
  }
};