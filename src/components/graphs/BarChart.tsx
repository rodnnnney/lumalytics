"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartDataItem } from "@/types/metaObj";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";

const chartConfig = {
  attendees: {
    label: "Attendees",
    color: "hsl(var(--dark-green))",
  },
  reservations: {
    label: "Reservations",
    color: "hsl(var(--light-green))",
  },
} satisfies ChartConfig;

export function Component({ data }: { data: ChartDataItem[] }) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="font-medium">
            {payload[0]?.payload?.eventName || "Event"}
          </div>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {entry.name}:
                </span>
              </div>
              <span className="text-sm font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-8">
      <CardHeader>
        <CardTitle>
          {data && data.length > 0 ? data[0].eventName : "Event Statistics"}
        </CardTitle>
        <CardDescription>Attendance vs Reservations</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <ChartTooltip cursor={false} content={<CustomTooltip />} />
            <Bar dataKey="Attendees" fill="var(--dark-green)" radius={4} />
            <Bar dataKey="Reservations" fill="var(--light-green)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Event Attendance Overview
        </div>
      </CardFooter>
    </Card>
  );
}
