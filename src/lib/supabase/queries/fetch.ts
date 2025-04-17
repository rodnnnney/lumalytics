import { supabase } from "../client";

export const fetchMeta = async (userid: string) => {
  const { data, error } = await supabase
    .from("allMeta")
    .select("*")
    .eq("userid", userid);
  if (error) {
    throw error;
  }
  return data;
};

export const fetchNames = async (userid: string) => {
  const { data, error } = await supabase
      .from("allMeta")
      .select("eventname, eventdate, eventid, filepath")
      .eq("userid", userid);
  if (error) {
    throw error;
  }
  return data;
};

export const fetchUsers = async ( userid: string ,eventid :string ) => {
  const { data, error } = await supabase
      .from("allAttendees")
      .select("*")
      .eq("userid", userid)
      .eq("eventid", eventid);

  if (error) {
    throw error;
  }
  return data;
};