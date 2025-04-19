'use client';

import { PieChart as MUIPieChart } from '@mui/x-charts/PieChart';

type PieDataItem = {
  id: number;
  value: number;
  label: string;
  color: string;
};

type BasicPieProps = {
  data?: PieDataItem[];
};

export default function BasicPie({ data }: BasicPieProps = {}) {
  const chartData =
    data && data.length > 0
      ? data
      : [
          { id: 0, value: 10, label: 'No Data A' },
          { id: 1, value: 15, label: 'No Data B' },
          { id: 2, value: 20, label: 'No Data C' },
        ];

  return (
    <MUIPieChart
      series={[
        {
          data: chartData,
        },
      ]}
      height={200}
    />
  );
}
