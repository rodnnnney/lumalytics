import { createClient } from "@supabase/supabase-js";

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(
  "https://xbomhuriakuotefgvlxa.supabase.co",
  supabaseKey
);

export async function getAllTables(): Promise<string[]> {
  const { data, error } = await supabase.rpc("get_table_names");

  if (error) {
    console.error("Error fetching table names:", error);
    return [];
  }

  console.log(
    "Table names:",
    data.map((row: { table_name: string }) => row.table_name)
  );
  return data.map((row: { table_name: string }) => row.table_name);
}

