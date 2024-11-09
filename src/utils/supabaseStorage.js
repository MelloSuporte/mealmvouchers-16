import { supabase } from '../config/supabase.js';
import logger from '../config/logger.js';

export const ensureLogosBucket = async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const logosBucket = buckets?.find(b => b.name === 'logos');
    
    if (!logosBucket) {
      const { error: createBucketError } = await supabase.storage.createBucket('logos', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif']
      });
      
      if (createBucketError) throw createBucketError;
      logger.info('Created logos bucket successfully');
    }
  } catch (error) {
    logger.error('Error ensuring logos bucket exists:', error);
    throw error;
  }
};

export const uploadLogo = async (fileBuffer, originalName) => {
  try {
    await ensureLogosBucket();
    
    const fileName = `company-logos/${Date.now()}-${originalName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(fileName, fileBuffer, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName);
      
    return data.publicUrl;
  } catch (error) {
    logger.error('Error uploading logo:', error);
    throw error;
  }
};