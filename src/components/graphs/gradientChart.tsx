"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
  ChartTooltipContent,
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
    <Card className="p-4 h-full">
      <CardHeader>
        <CardTitle>
          {data && data.length > 0 ? data[0].eventName : "Event Attendance"}
        </CardTitle>
        <CardDescription>Showing attendance vs reservations</CardDescription>
      </CardHeader>
      <CardContent className="h-[calc(100%-140px)]">
        <div className="h-full">
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data}
            height={180}
            margin={{
              left: -20,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={3}
            />
            <ChartTooltip cursor={false} content={<CustomTooltip />} />
            <Area
              dataKey="Reservations"
              type="natural"
              fill="var(--light-green)"
              fillOpacity={0.4}
              stroke="var(--light-green)"
              stackId="a"
            />
            <Area
              dataKey="Attendees"
              type="natural"
              fill="var(--dark-green)"
              fillOpacity={0.4}
              stroke="var(--dark-green)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Event Attendance Overview
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
