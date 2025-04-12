"use client";

import { HomeCard } from "@/components/HomeCard";
import { Component as PieGraph } from "@/components/graphs/piegraph";
import { Select } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChartDataItem, PieGraphDataItem } from "@/types/metaObj";
import { Component as BarChart } from "@/components/graphs/BarChart";
import { Component as GradientChart } from "@/components/graphs/gradientChart";
import { supabase } from "@/lib/supabase/client";
import { fetchMeta } from "@/lib/supabase/queries/fetch";

export default function Home() {
  const [timeRange, setTimeRange] = useState("90d");
  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const [checkInRate, setCheckInRate] = useState(0);
  const [returnRate, setReturnRate] = useState(0);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [pieGraphData, setPieGraphData] = useState<PieGraphDataItem[]>([]);
  const [numberEvents, setNumberEvents] = useState(0);

  const getUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error(error);
    }
    console.log("[INFO] - User data:", data.user?.id);
    return data;
  };

  const fetchCsvMeta = async () => {
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
    }
  };

  useEffect(() => {
    fetchCsvMeta();
  }, []);

  return (
    <div className="flex w-full flex-col ">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <p className="text-md font-semibold text-gray-600">Welcome home</p>
          <p className="inline-block w-fit bg-gradient-to-r from-[#7195e8] to-[#f27676] bg-clip-text text-3xl font-bold text-transparent">
            Your overview
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}></Select>
      </div>

      <div className="mb-6 flex justify-end">
        <Button onClick={async () => fetchMeta((await getUser()).user?.id!)}>
          Put All MetaData
        </Button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        <HomeCard value={totalCheckIns} description="Total Check ins" />
        <HomeCard value={numberEvents} description="Total Events" />
        <HomeCard value={`${checkInRate}%`} description="Check-in Rate" />
        {numberEvents > 1 ? (
          <HomeCard value={`${returnRate}%`} description="Return Rate" />
        ) : (
          <HomeCard value={`0%`} description="Return Rate" />
        )}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 md:gap-6">
        <div>
          <GradientChart data={chartData} />
        </div>
        
      </div>
    </div>
  );
}
