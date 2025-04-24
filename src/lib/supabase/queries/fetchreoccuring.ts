import { supabase } from '../client';

export const fetchReoccuring = async (userid: string) => {
  const { data, error } = await supabase.from('attendeeProfile').select('*').eq('userid', userid);

  if (error) {
    throw error;
  }
  return data;
};
