"use client";

import { HomeCard } from "@/components/HomeCard";
import { Component as PieGraph } from "@/components/graphs/piegraph";
import { Select } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useFetch } from "@/hooks/fetchData";
import { fetchMeta } from "@/lib/supa/fetchMeta";
import { ChartDataItem, PieGraphDataItem } from "@/types/metaObj";
import { Component as BarChart } from "@/components/graphs/BarChart";
import { Component as GradientChart } from "@/components/graphs/gradientChart";

import supabase from "@/lib/supa/supa";

export default function Home() {
  const [timeRange, setTimeRange] = useState("90d");
  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const [checkInRate, setCheckInRate] = useState("0%");
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [pieGraphData, setPieGraphData] = useState<PieGraphDataItem[]>([]);

  const {
    data: metaData,
    loading,
    error,
  } = useFetch<ChartDataItem[]>(fetchMeta, true, []);

  const getUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error(error);
    }
    console.log("[INFO] - User data:", data.user?.id);
    return data;
  };

  // useEffect(() => {
  //   if (metaData && metaData.length > 0) {
  //     const attendeesTotal = metaData.reduce(
  //       (sum, event) =>
  //         sum + (parseInt(event.Attendees as unknown as string) || 0),
  //       0
  //     );
  //     setTotalCheckIns(attendeesTotal);

  //     const reservationsTotal = metaData.reduce(
  //       (sum, event) =>
  //         sum + (parseInt(event.Reservations as unknown as string) || 0),
  //       0
  //     );
  //     const rate =
  //       reservationsTotal > 0
  //         ? Math.round((attendeesTotal / reservationsTotal) * 100)
  //         : 0;
  //     setCheckInRate(`${rate}%`);

  //     const calculatedPieGraphData: PieGraphDataItem[] = [
  //       {
  //         label: "Attendees",
  //         value: attendeesTotal,
  //         fill: "var(--light-green)",
  //         // Add other required props if PieGraph expects them
  //         // title: "Pie Chart",
  //         // description: "January - June 2024",
  //         // trendingText: "Trending up by 5.2% this month",
  //         // footerText: "Showing total attendees for the last 6 months",
  //       },
  //       {
  //         label: "RSVPs",
  //         value: reservationsTotal,
  //         fill: "var(--dark-green)",
  //         // Add other required props if PieGraph expects them
  //         // title: "Pie Chart",
  //         // description: "January - June 2024",
  //         // trendingText: "Trending up by 5.2% this month",
  //         // footerText: "Showing total reservations for the last 6 months",
  //       },
  //     ];

  //     setPieGraphData(calculatedPieGraphData); // Set the calculated data

  //     const calculatedChartData =
  //       metaData
  //         ?.map((event) => ({
  //           date: event.date,
  //           Reservations:
  //             parseInt(event.Reservations as unknown as string) || 0,
  //           Attendees: parseInt(event.Attendees as unknown as string) || 0,
  //           eventName: event.eventName,
  //         }))
  //         .sort((a, b) => {
  //           const dateA = new Date(a.date);
  //           const dateB = new Date(b.date);
  //           return dateA.getTime() - dateB.getTime();
  //         }) || [];
  //     console.log(calculatedChartData);

  //     setChartData(calculatedChartData);
  //   } else {
  //     setTotalCheckIns(0);
  //     setCheckInRate("0%");
  //     setChartData([]);
  //     setPieGraphData([]);
  //   }
  // }, [metaData]);

  const defaultPieProps = {
    title: "Pie Chart",
    description: "Data Overview",
  };

  return (
    <div className="flex w-full flex-col">
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
        <Button onClick={async () => getUser()}>Put All MetaData</Button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        <HomeCard value={metaData?.length || 0} description="Total Events" />
        <HomeCard value={totalCheckIns} description="Total Check ins" />
        <HomeCard value={checkInRate} description="Check-in Rate" />
        <HomeCard value={checkInRate} description="Return Rate Rate" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 md:gap-6">
        <div>
          <GradientChart data={chartData} />
        </div>
        <div>
          <BarChart data={chartData} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        <div className="col-span-1 md:col-span-1">
          <PieGraph
            chartData={pieGraphData}
            title="Attendance Overview"
            description="Check-ins vs Reservations"
          />
        </div>
        <div className="col-span-1 md:col-span-1">
          <HomeCard value={"53%"} description="Total Rate" />
        </div>
        <div className="col-span-1 md:col-span-1">
          <PieGraph
            chartData={[]}
            {...defaultPieProps}
            title="Another Metric"
            description="Example Description"
          />
        </div>
      </div>
    </div>
  );
}
