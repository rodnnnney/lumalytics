import { UploadItem } from '@/app/upload/page';
import { supabase } from './client';

export const uploadFile = async (uploadItem: UploadItem, path: string) => {
  const { data, error } = await supabase.storage
    .from('csvs')
    .upload(`${path}/${uploadItem.file.name}`, uploadItem.file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  return data;
};
