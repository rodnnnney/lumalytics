import { supabase } from "../client";

export const fetchMeta = async (userid: string) => {
  const { data, error } = await supabase
    .from("allMeta")
    .select("*")
    .eq("userid", userid);
  if (error) {
    throw error;
  }
  console.log("[INFO] - Fetched meta data:", data);
  return data;
};
