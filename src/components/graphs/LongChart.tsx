"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartDataItem } from "@/types/metaObj";

const defaultChartData: ChartDataItem[] = [
  {
    date: "2024-04-01",
    Reservations: 222,
    Attendees: 150,
    eventName: "Event 1",
  },
  {
    date: "2024-04-02",
    Reservations: 97,
    Attendees: 180,
    eventName: "Event 2",
  },
  {
    date: "2024-04-03",
    Reservations: 167,
    Attendees: 120,
    eventName: "Event 3",
  },
  {
    date: "2024-04-04",
    Reservations: 242,
    Attendees: 260,
    eventName: "Event 4",
  },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  Attendees: {
    label: "Check-ins",
    color: "hsl(var(--chart-1))",
  },
  Reservations: {
    label: "Reservations",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

// Define component props interface
interface ComponentProps {
  chartData?: ChartDataItem[];
  title?: string;
}

export function Component({
  chartData = defaultChartData,
  title = "Your events history",
}: ComponentProps) {
  const [timeRange, setTimeRange] = React.useState("90d");

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="bg-white p-6 rounded-lg shadow-sm">
      <CardHeader className="flex items-center gap-2 space-y-0 sm:flex-row">
        <div className="grid text-center sm:text-left">
          <CardTitle>{title}</CardTitle>
          <CardDescription></CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillAttendees" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-Attendees)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-Attendees)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillReservations" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-Reservations)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-Reservations)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value, payload) => {
                    if (payload && payload.length > 0) {
                      const dataIndex = filteredData.findIndex(
                        (item) => item.date === value
                      );
                      if (dataIndex !== -1) {
                        return filteredData[dataIndex].eventName;
                      }
                    }
                    return value;
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="Reservations"
              type="natural"
              fill="url(#fillReservations)"
              stroke="var(--color-Reservations)"
              stackId="a"
              animationDuration={1500}
              animationBegin={0}
            />
            <Area
              dataKey="Attendees"
              type="natural"
              fill="url(#fillAttendees)"
              stroke="var(--color-Attendees)"
              stackId="a"
              animationDuration={1500}
              animationBegin={300}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
