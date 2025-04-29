import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { ChartDataItem } from '@/types/metaObj';

interface CustomLabelsProps {
  eventData?: ChartDataItem[];
}

export default function CustomLabels({ eventData = [] }: CustomLabelsProps) {
  const processedData = React.useMemo(() => {
    if (!eventData || !eventData.length) {
      return {
        xLabels: ['No Data'],
        checkIns: [0],
        rsvps: [0],
      };
    }

    const recentEvents = [...eventData]
      .sort((a, b) => {
        const dateA = a.date || a.date || '';
        const dateB = b.date || b.date || '';
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
      .reverse();

    return {
      xLabels: recentEvents.map(event => {
        const name = event.eventName || '';
        return name || 'Unnamed';
      }),
      checkIns: recentEvents.map(event => {
        const attendance = event.Attendees;
        return typeof attendance === 'string' ? parseInt(attendance) || 0 : attendance || 0;
      }),
      rsvps: recentEvents.map(event => {
        const rsvps = event.Reservations;
        return typeof rsvps === 'string' ? parseInt(rsvps) || 0 : rsvps || 0;
      }),
    };
  }, [eventData]);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Event Attendance</h3>
      <BarChart
        xAxis={[{ scaleType: 'band', data: processedData.xLabels }]}
        series={[
          { data: processedData.checkIns, label: 'Check-ins', color: '#f27676' },
          { data: processedData.rsvps, label: 'RSVPs', color: '#7195e8' },
        ]}
        height={350}
      />
    </div>
  );
}
