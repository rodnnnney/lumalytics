'use client';

import { HomeCard } from '@/components/HomeCard';
import { Select } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCsvMetaStore } from '@/store/csvMetaStore';
import { fetchMeta } from '@/lib/supabase/queries/fetch';
import { fetchReoccuring } from '@/lib/supabase/queries/fetchreoccuring';
import { supabase } from '@/lib/supabase/client';
import { formatDateForChart } from '@/utils/format';
import { getReturningUsersCount } from '@/utils/timeCompare';

import NumberFlow from '@number-flow/react';
import { EventData, metadata, userObject } from '@/types/metaObj';
import AddEventButton from '@/components/addEvent/AddEventButton';
import CustomLabels from '@/components/graphs/barChart';
import SimpleLineChart from '@/components/graphs/LineGraph';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [timeRange, setTimeRange] = useState('90d');
  const [returnRate, setReturnRate] = useState<string | null>(null);
  const [eventData, setEventData] = useState<EventData[]>([]);

  const [sortField, setSortField] = useState('eventdate');
  const [sortDirection, setSortDirection] = useState('desc');

  const [metaData, setMetaData] = useState<metadata[]>([]);

  const router = useRouter();

  const [userAnalytics, setUserAnalytics] = useState<userObject[]>([]);

  useEffect(() => {
    const fetchUserAnalytics = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) return;
      const users = await fetchReoccuring(data.user?.id);
      setUserAnalytics(users);
    };
    fetchUserAnalytics();
  }, []);

  const {
    totalCheckIns,
    checkInRate,
    numberEvents,
    isLoading,
    graphData,
    fetchCsvMeta,
    refreshCsvMeta,
  } = useCsvMetaStore();

  useEffect(() => {
    const loadInitialData = async () => {
      console.log('[Dashboard] Loading initial CSV metadata');
      const { data } = await supabase.auth.getUser();
      if (data.user?.id) {
        const eventData = await fetchMeta(data.user.id);
        setEventData(eventData);
      }
      await fetchCsvMeta();
    };
    loadInitialData();
  }, [fetchCsvMeta]);

  useEffect(() => {
    const savedSortField = localStorage.getItem('eventSortField');
    const savedSortDirection = localStorage.getItem('eventSortDirection');

    if (savedSortField) setSortField(savedSortField);
    if (savedSortDirection) setSortDirection(savedSortDirection);

    console.log('[Dashboard] Saved sort field', savedSortField, savedSortDirection);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) return;

      const meta = await fetchMeta(data.user?.id);

      setMetaData(
        meta.map(event => ({
          created_at: event.created_at,
          eventdate: event.eventdate,
          eventid: event.eventid,
          eventname: event.eventname,
          filepath: event.filepath,
          id: event.id,
          totalattendance: event.totalattendance,
          totalrsvps: event.totalrsvps,
          userid: event.userid,
        }))
      );

      const returningUsers = userAnalytics.filter(
        user => Number(user.total_events_checked_in) > 0
      ).length;

      const returnRateValue =
        totalCheckIns > 0 ? ((1 - returningUsers / totalCheckIns) * 100).toFixed(1) : '0';

      setReturnRate(Number(returnRateValue));
    };
    fetchUser();
  }, [userAnalytics, totalCheckIns]);

  useEffect(() => {
    localStorage.setItem('eventSortField', sortField);
    localStorage.setItem('eventSortDirection', sortDirection);
  }, [sortField, sortDirection]);

  const sortMetaData = () => {
    return [...metaData].sort((a, b) => {
      return new Date(a.eventdate).getTime() - new Date(b.eventdate).getTime();
    });
  };

  const handleSortToggle = (field: string) => {
    console.log(`Sort Field: ${field}, Sort Direction: ${sortDirection}`);
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;

    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  const getSortedEventData = () => {
    if (!Array.isArray(eventData) || eventData.length === 0) return [];

    return [...eventData].sort((a, b) => {
      let valA, valB;

      switch (sortField) {
        case 'eventname':
          valA = a['eventname'] || '';
          valB = b['eventname'] || '';
          return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);

        case 'eventdate':
          valA = new Date(a['eventdate'] || 0);
          valB = new Date(b['eventdate'] || 0);

          return sortDirection === 'asc' ? valA - valB : valB - valA;

        case 'checkins':
          valA = a.totalattendance || 0;
          valB = b.totalattendance || 0;

          return sortDirection === 'asc' ? valA - valB : valB - valA;

        case 'rsvps':
          valA = a.totalrsvps || 0;
          valB = b.totalrsvps || 0;

          return sortDirection === 'asc' ? valA - valB : valB - valA;

        case 'ratio':
          valA = a.totalattendance / a.totalrsvps || 0;
          valB = b.totalattendance / b.totalrsvps || 0;

          return sortDirection === 'asc' ? valA - valB : valB - valA;

        default:
          return 0;
      }
    });
  };

  const sortedEventData = getSortedEventData();

  const sortedMetaData = sortMetaData();
  console.log(`Sorted MetaData:`, sortedMetaData);

  return (
    <div className="flex w-full flex-col ">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <p className="text-md font-semibold text-gray-600">Welcome home</p>
          <p className="inline-block w-fit bg-gradient-to-r from-[#7195e8] to-[#f27676] bg-clip-text text-2xl font-bold text-transparent">
            Your overview
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}></Select>
      </div>

      <div className="mb-6 flex justify-end gap-4">
        <Button
          onClick={async () => {
            const updatedMetrics = await refreshCsvMeta();
            console.log('Dashboard received updated metrics:', updatedMetrics);
          }}
        >
          Refresh Metadata
        </Button>

        <Button
          onClick={() => {
            router.push('/upload');
          }}
        >
          Upload
        </Button>

        <AddEventButton />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        <HomeCard
          value={totalCheckIns}
          description="Total Check ins"
          hoverInfo={[
            ['Total Check-ins', totalCheckIns.toString()],
            ['Total RSVPs', Math.floor((totalCheckIns / checkInRate) * 100).toString()],
          ]}
        />
        <HomeCard
          value={numberEvents}
          description="Total Events"
          hoverInfo={sortedEventData.map((event, index) => [
            `Event ${index + 1}`,
            event['eventname'],
          ])}
        />
        <HomeCard value={`${checkInRate}%`} description="Check-in Rate" />
        {numberEvents > 1 ? (
          <HomeCard
            value={`${returnRate}%`}
            description="Return Rate"
            hoverInfo={[
              [
                'Recurring (>1 event)',
                Math.floor((returnRate / 100) * totalCheckIns).toString() || '0',
              ],
              [
                'First Time Attendees',
                totalCheckIns - Math.floor((returnRate / 100) * totalCheckIns).toString(),
              ],
            ]}
          />
        ) : (
          <>
            <HomeCard value="0%" description="Return Rate" />
          </>
        )}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 md:gap-6">
        <div>
          <CustomLabels eventData={eventData} />
        </div>

        <div>
          <div className="overflow-x-auto rounded-b-sm">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-4 py-2 text-left text-sm font-medium text-gray-600"
                    onClick={() => handleSortToggle('eventname')}
                  >
                    Event Name {renderSortIcon('eventname')}
                  </th>
                  <th
                    className="px-4 py-2 text-left text-sm font-medium text-gray-600"
                    onClick={() => handleSortToggle('eventdate')}
                  >
                    Event Date {renderSortIcon('eventdate')}
                  </th>
                  <th
                    className="px-4 py-2 text-left text-sm font-medium text-gray-600"
                    onClick={() => handleSortToggle('checkins')}
                  >
                    Check-ins {renderSortIcon('checkins')}
                  </th>
                  <th
                    className="px-4 py-2 text-left text-sm font-medium text-gray-600"
                    onClick={() => handleSortToggle('rsvps')}
                  >
                    RSVPs {renderSortIcon('rsvps')}
                  </th>
                  <th
                    className="px-4 py-2 text-left text-sm font-medium text-gray-600"
                    onClick={() => handleSortToggle('ratio')}
                  >
                    Ratio {renderSortIcon('ratio')}
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      Loading event data...
                    </td>
                  </tr>
                ) : eventData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500"></td>
                  </tr>
                ) : (
                  sortedEventData.map((event, index) => {
                    const checkIns = event.totalattendance || 0;
                    const rsvps = event.totalrsvps || 0;
                    const ratio = rsvps > 0 ? Math.round((checkIns / rsvps) * 100) : 0;

                    return (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-3 ">
                          {index + 1} - {event['eventname']}
                        </td>
                        <td className="px-4 py-3 ">{formatDateForChart(event['eventdate'])}</td>
                        <td className="px-4 py-3 ">
                          <NumberFlow value={checkIns} />
                        </td>
                        <td className="px-4 py-3 ">
                          <NumberFlow value={rsvps} />
                        </td>
                        <td className="px-4 py-3 ">
                          <NumberFlow value={ratio} suffix={'%'} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
