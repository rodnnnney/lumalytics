import { create } from 'zustand';
import { PieGraphDataItem } from '@/types/metaObj';
import { fetchMeta } from '@/lib/supabase/queries/fetch';
import { supabase } from '@/lib/supabase/client';

// Define the store state interface
interface CsvMetaState {
  totalCheckIns: number;
  checkInRate: number;
  numberEvents: number;
  pieGraphData: PieGraphDataItem[];
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  fetchCsvMeta: () => Promise<any>;
  refreshCsvMeta: () => Promise<any>;
}

// Create the store
export const useCsvMetaStore = create<CsvMetaState>((set, get) => ({
  // Initial state
  totalCheckIns: 0,
  checkInRate: 0,
  numberEvents: 0,
  pieGraphData: [],
  isLoading: false,
  error: null,

  // Actions
  fetchCsvMeta: async () => {
    try {
      set({ isLoading: true });
      
      // Get the current user
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error(error);
        set({ error });
        return null;
      }
      
      const user = data.user;
      console.log("[INFO] - User data:", user?.id);
      
      if (user?.id) {
        const fetch = await fetchMeta(user.id);
        console.log("CSV Meta:", fetch);

        // Calculate total check-ins by looping through the CSV metadata
        let totalCheckins = 0;
        let totalRsvps = 0;

        // Loop through each event and sum up the totalattendance
        fetch.forEach((event) => {
          totalCheckins += event.totalattendance || 0;
          totalRsvps += event.totalrsvps || 0;
        });

        // Calculate check-in rate if there are any RSVPs
        const checkInRate = totalRsvps > 0 
          ? Math.round((totalCheckins / totalRsvps) * 100) 
          : 0;

        // Update state with all the new values
        set({
          totalCheckIns: totalCheckins,
          checkInRate,
          numberEvents: fetch.length,
          pieGraphData: [
            { label: "Check-ins", value: totalCheckins, fill: "#7195e8" },
            { label: "RSVPs", value: totalRsvps, fill: "#f27676" },
          ],
          isLoading: false,
        });

        return {
          totalCheckins,
          totalRsvps,
          events: fetch,
          checkInRate,
        };
      }
      
      set({ isLoading: false });
      return null;
    } catch (err) {
      console.error("Error fetching CSV meta:", err);
      const error = err instanceof Error ? err : new Error(String(err));
      set({ error, isLoading: false });
      return null;
    }
  },

  refreshCsvMeta: async () => {
    console.log("[INFO] - Refreshing CSV metadata");
    const result = await get().fetchCsvMeta();
    console.log("[INFO] - CSV metadata refreshed", result);
    return result;
  },
}));
