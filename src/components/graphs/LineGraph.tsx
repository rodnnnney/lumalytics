'use client';

import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';

const margin = { right: 24 };

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
  // Return null if no data is provided
  if ((!series1Data || series1Data.length === 0) && (!series2Data || series2Data.length === 0)) {
    return null;
  }

  const data1 = series1Data && series1Data.length > 0 ? series1Data : [];
  const data2 = series2Data && series2Data.length > 0 ? series2Data : [];
  const labels = xLabels && xLabels.length > 0 ? xLabels : [];

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
