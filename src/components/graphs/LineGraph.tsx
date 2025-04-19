'use client';

import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';

const margin = { right: 24 };

// Default data
const defaultUData = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
const defaultPData = [2400, 1398, 9800, 3908, 4800, 3800, 4300];
const defaultXLabels = ['Page A', 'Page B', 'Page C', 'Page D', 'Page E', 'Page F', 'Page G'];

type SeriesData = number[];
type Labels = string[];

type SimpleLineChartProps = {
  series1Data?: SeriesData;
  series1Label?: string;
  series2Data?: SeriesData;
  series2Label?: string;
  xLabels?: Labels;
  height?: number;
};

export default function SimpleLineChart({
  series1Data,
  series1Label = 'Series 1',
  series2Data,
  series2Label = 'Series 2',
  xLabels,
  height = 300,
}: SimpleLineChartProps = {}) {
  const data1 = series1Data && series1Data.length > 0 ? series1Data : defaultPData;
  const data2 = series2Data && series2Data.length > 0 ? series2Data : defaultUData;
  const labels = xLabels && xLabels.length > 0 ? xLabels : defaultXLabels;

  return (
    <LineChart
      height={height}
      series={[
        { data: data1, label: series1Label, color: '#f27676' },
        { data: data2, label: series2Label, color: '#7195e8' },
      ]}
      xAxis={[{ scaleType: 'point', data: labels }]}
      yAxis={[{ width: 50 }]}
      margin={margin}
    />
  );
}
