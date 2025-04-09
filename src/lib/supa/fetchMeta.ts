import { ChartDataItem } from "@/types/metaObj";
import { supabase } from "./fetchAllTables";

export async function fetchMeta(): Promise<ChartDataItem[]> {
  try {
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out")), 10000);
    });

    const fetchPromise = supabase.from("MetaTable").select("*");

    // Race the fetch against the timeout
    const { data, error } = (await Promise.race([
      fetchPromise,
      timeoutPromise,
    ])) as any;

    if (error) {
      console.error("Error fetching meta:", error);
      return [];
    }

    console.log("[info] MetaTable data:", data);

    if (!Array.isArray(data)) {
      console.error("Expected array, got:", typeof data);
      return [];
    }

    return data.map(
      (item): ChartDataItem => ({
        date: item.event_time || "",
        eventName: item.event_name || "",
        Reservations: item.reservations || "0",
        Attendees: item.attendees || "0",
      })
    );
  } catch (error) {
    console.error("Exception in fetchMeta:", error);
    return [];
  }
}
