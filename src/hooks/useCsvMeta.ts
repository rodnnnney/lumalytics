import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { fetchMeta } from "@/lib/supabase/queries/fetch";
import { PieGraphDataItem } from "@/types/metaObj";

export const useCsvMeta = () => {
  // Add a version state to force re-renders when data is refreshed
  const [version, setVersion] = useState(0);
  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const [checkInRate, setCheckInRate] = useState(0);
  const [numberEvents, setNumberEvents] = useState(0);
  const [pieGraphData, setPieGraphData] = useState<PieGraphDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error(error);
      setError(error);
    }
    console.log("[INFO] - User data:", data.user?.id);
    return data;
  };

  const fetchCsvMeta = async () => {
    try {
      setIsLoading(true);
      const { user } = await getUser();

      if (user?.id) {
        const fetch = await fetchMeta(user.id);
        console.log("CSV Meta:", fetch);

        setNumberEvents(fetch.length);

        // Calculate total check-ins by looping through the CSV metadata
        let totalCheckins = 0;
        let totalRsvps = 0;

        // Loop through each event and sum up the totalattendance
        fetch.forEach((event) => {
          totalCheckins += event.totalattendance || 0;
          totalRsvps += event.totalrsvps || 0;
        });

        setTotalCheckIns(totalCheckins);

        // Calculate check-in rate if there are any RSVPs
        if (totalRsvps > 0) {
          const rate = Math.round((totalCheckins / totalRsvps) * 100);
          setCheckInRate(rate);
        }

        // Update pie graph data for check-ins vs reservations
        setPieGraphData([
          { label: "Check-ins", value: totalCheckins, fill: "#7195e8" },
          {
            label: "RSVPs",
            value: totalRsvps,
            fill: "#f27676",
          },
        ]);

        return {
          totalCheckins,
          totalRsvps,

          events: fetch,
          checkInRate:
            totalRsvps > 0 ? Math.round((totalCheckins / totalRsvps) * 100) : 0,
        };
      }
      return null;
    } catch (err) {
      console.error("Error fetching CSV meta:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCsvMeta = async () => {
    console.log("[INFO] - Refreshing CSV metadata");
    const result = await fetchCsvMeta();
    // Increment version to force components using this hook to re-render
    setVersion((v) => v + 1);
    console.log("[INFO] - CSV metadata refreshed", result);
    return result;
  };

  useEffect(() => {
    fetchCsvMeta();
  }, []);

  return {
    totalCheckIns,
    checkInRate,
    numberEvents,
    pieGraphData,
    isLoading,
    error,
    refreshCsvMeta,
    version, // Include version in the returned object
  };
};
