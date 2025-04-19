import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';

interface CustomLabelsProps {
  eventData?: any[];
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
        const dateA = a.eventdate || a.date || '';
        const dateB = b.eventdate || b.date || '';
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
      .slice(0, 5)
      .reverse();

    return {
      xLabels: recentEvents.map(event => {
        const name = event.eventname || event.name || '';
        return name || 'Unnamed';
      }),
      checkIns: recentEvents.map(event => {
        const attendance = event.totalattendance;
        return typeof attendance === 'string' ? parseInt(attendance) || 0 : attendance || 0;
      }),
      rsvps: recentEvents.map(event => {
        const rsvps = event.totalrsvps;
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
          { data: processedData.checkIns, stack: 'A', label: 'Check-ins', color: '#f27676' },
          { data: processedData.rsvps, stack: 'B', label: 'RSVPs', color: '#7195e8' },
        ]}
        barLabel={(item, context) => {
          if ((item.value ?? 0) > 0) {
            return item.value?.toString();
          }
          return null;
        }}
        height={350}
      />
    </div>
  );
}
