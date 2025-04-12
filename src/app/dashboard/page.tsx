"use client";

import { HomeCard } from "@/components/HomeCard";
import { Select } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChartDataItem } from "@/types/metaObj";
import { Component as GradientChart } from "@/components/graphs/gradientChart";
import { useCsvMetaStore } from "@/store/csvMetaStore";

export default function Home() {
  const [timeRange, setTimeRange] = useState("90d");
  const [returnRate, setReturnRate] = useState(0);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);

  // Use the Zustand store to get CSV metadata
  const {
    totalCheckIns,
    checkInRate,
    numberEvents,
    pieGraphData,
    isLoading,
    error,
    fetchCsvMeta,
    refreshCsvMeta,
  } = useCsvMetaStore();


  useEffect(() => {

    const loadInitialData = async () => {
      console.log("[Dashboard] Loading initial CSV metadata");
      await fetchCsvMeta();
    };
    loadInitialData();
  }, [fetchCsvMeta]);

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
        <Button
          onClick={async () => {
            const updatedMetrics = await refreshCsvMeta();
            console.log("Dashboard received updated metrics:", updatedMetrics);
            // No need to force re-render with Zustand - it handles this automatically
          }}
        >
          Refresh Metadata
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
