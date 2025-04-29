'use client';

import { HomeCard } from '@/components/HomeCard';
import { Select } from '@/components/ui/select';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { formatDateForChart } from '@/utils/format';

import NumberFlow from '@number-flow/react';
import { ChartDataItem, EventData, metadata, userObject } from '@/types/metaObj';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import CustomLabels from '@/components/graphs/BarChart';
import { fetchMeta, fetchReoccuring } from '@/queries/fetch';

export default function Home() {
  const [timeRange, setTimeRange] = useState('90d');
  const [sortField, setSortField] = useState('eventdate');
  const [sortDirection, setSortDirection] = useState('desc');
  const isInitialMount = useRef(true);
  const {
    user,
    error: authError,
    //  loading: authLoading
  } = useAuth();

  const router = useRouter();

  interface CsvMetaData {
    totalCheckIns: number;
    checkInRate: number;
    numberEvents: number;
    returnRate: string;
    returningUsers: string;
    graphData: ChartDataItem[];
    events: string[];
    totalRsvps: number;
    userAnalytics: userObject[];
    eventData: EventData[];
  }

  const fetchCsvMetaData = async (): Promise<CsvMetaData | null> => {
    if (authError || !user) {
      console.error('Error fetching user or user not found:', authError);
      throw authError || new Error('User not found');
    }

    console.log('[INFO] - Fetching CSV Meta and User Analytics for User ID:', user.id);

    if (user.id) {
      try {
        const [rawMetaData, userAnalyticsData] = await Promise.all([
          fetchMeta(user.id),
          fetchReoccuring(user.id),
        ]);

        let totalCheckins = 0;
        let totalRsvps = 0;
        const eventNames: string[] = [];
        const graph: ChartDataItem[] = [];

        rawMetaData.forEach((event: metadata) => {
          const eventName = typeof event.eventname === 'string' ? event.eventname : 'Unnamed Event';
          eventNames.push(eventName);

          const attendance = Number(event.totalattendance ?? 0);
          const rsvps = Number(event.totalrsvps ?? 0);

          totalCheckins += attendance;
          totalRsvps += rsvps;

          const graphEventName =
            typeof event.eventname === 'string' ? event.eventname : 'Unknown Event';
          const graphDate = event.eventdate ? formatDateForChart(event.eventdate) : 'Unknown Date';

          graph.push({
            eventName: graphEventName,
            date: graphDate,
            Reservations: rsvps,
            Attendees: attendance,
          });
        });

        const checkInRate = totalRsvps > 0 ? Math.round((totalCheckins / totalRsvps) * 100) : 0;

        const returningUsers = userAnalyticsData.filter(
          (user: { total_events_checked_in: any }) => Number(user.total_events_checked_in) > 0
        ).length;

        console.log('Returning Users:', returningUsers);

        const returnRateValue =
          totalCheckins > 0 ? ((1 - returningUsers / totalCheckins) * 100).toFixed(1) : '0';

        console.log(returnRateValue);

        const processedData: CsvMetaData = {
          events: eventNames,
          totalCheckIns: totalCheckins,
          checkInRate,
          numberEvents: rawMetaData.length,
          returnRate: returnRateValue,
          returningUsers: String(returningUsers),
          graphData: graph,
          totalRsvps,
          userAnalytics: userAnalyticsData,
          eventData: rawMetaData,
        };

        // console.log('[INFO] - Processed Combined MetaData:', processedData.eventData);
        return processedData;
      } catch (fetchError) {
        // console.error('Error fetching or processing data:', fetchError);
        throw fetchError instanceof Error ? fetchError : new Error(String(fetchError));
      }
    } else {
      console.warn('[WARN] - No user ID found after initial check.');
      return null;
    }
  };

  const {
    data,
    //error,
    isLoading: csvLoading,
  } = useQuery({
    queryKey: ['csvMeta', user?.id],
    queryFn: fetchCsvMetaData,
    staleTime: Infinity,
    gcTime: 1 * 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !!user,
  });

  useEffect(() => {
    const savedSortField = localStorage.getItem('eventSortField');
    const savedSortDirection = localStorage.getItem('eventSortDirection');

    console.log('[Dashboard Initial Load] Reading from localStorage:', {
      savedSortField,
      savedSortDirection,
    });

    if (savedSortField) setSortField(savedSortField);
    if (savedSortDirection) setSortDirection(savedSortDirection);
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      console.log('[Dashboard State Change] Writing to localStorage:', {
        sortField,
        sortDirection,
      });
      localStorage.setItem('eventSortField', sortField);
      localStorage.setItem('eventSortDirection', sortDirection);
    }
  }, [sortField, sortDirection]); // Still depends on the state variables

  // const sortMetaData = () => {
  //   return [...(data?.userAnalytics || [])].sort((a, b) => {
  //     return new Date(a.eventdate).getTime() - new Date(b.eventdate).getTime();
  //   });
  // };

  const handleSortToggle = (field: string) => {
    console.log(`[Dashboard Sort Toggle] Clicked field: ${field}. Current state:`, {
      sortField,
      sortDirection,
    });
    if (sortField === field) {
      setSortDirection(prev => {
        const nextDirection = prev === 'asc' ? 'desc' : 'asc';
        console.log(`[Dashboard Sort Toggle] Toggling direction for ${field} to: ${nextDirection}`);
        return nextDirection;
      });
    } else {
      console.log(`[Dashboard Sort Toggle] Setting new field: ${field}, direction: desc`);
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;

    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  const getSortedEventData = () => {
    if (!Array.isArray(data?.eventData) || data?.eventData.length === 0) return [];

    return [...data?.eventData].sort((a, b) => {
      let valA, valB;

      switch (sortField) {
        case 'eventname':
          valA = a.eventname || '';
          valB = b.eventname || '';
          return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);

        case 'eventdate': {
          const dateA = a.eventdate ? new Date(a.eventdate) : null;
          const dateB = b.eventdate ? new Date(b.eventdate) : null;

          const timeA = dateA && !isNaN(dateA.getTime()) ? dateA.getTime() : null;
          const timeB = dateB && !isNaN(dateB.getTime()) ? dateB.getTime() : null;

          if (timeA === null && timeB === null) return 0;
          if (timeA === null) return sortDirection === 'asc' ? 1 : -1;
          if (timeB === null) return sortDirection === 'asc' ? -1 : 1;

          return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
        }

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

  //const sortedMetaData = sortMetaData();

  return (
    <div className="flex w-full flex-col">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-md font-semibold text-gray-600">Welcome home</p>
          <p className="inline-block w-fit bg-gradient-to-r from-[#7195e8] to-[#f27676] bg-clip-text text-2xl font-bold text-transparent">
            Your overview
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange} />
          <Button
            className="text-white bg-luma-blue rounded-lg shadow-sm hover:bg-luma-blue/80 transition-colors duration-400"
            onClick={() => router.push('/upload')}
          >
            Upload Event
          </Button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        <HomeCard
          value={data?.totalCheckIns || 0}
          description="Total Check ins"
          hoverInfo={[
            ['Total Check-ins', data?.totalCheckIns.toString() || '0'],
            [
              'Total RSVPs',
              data?.totalRsvps?.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              }) || '0',
            ],
          ]}
        />
        <HomeCard
          value={data?.numberEvents || 0}
          description="Total Events"
          hoverInfo={data?.events?.map((event, index) => [`Event ${index + 1}`, event || ''])}
        />
        <HomeCard
          value={`${data?.checkInRate || 0}%`}
          description="Check-in Rate"
          hoverInfo={[
            ['Total Check-ins', data?.totalCheckIns.toString() || '0'],
            [
              'Total RSVPs',
              data?.totalRsvps?.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              }) || '0',
            ],
          ]}
        />
        <HomeCard
          value={`${data?.returnRate || 0}%`}
          description="Returning Users"
          hoverInfo={[
            ['Newcomers', data?.returningUsers?.toString() || '0'],
            [
              'Repeat Users',
              (Number(data?.totalCheckIns) - Number(data?.returningUsers)).toString() || '0',
            ],
          ]}
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 md:gap-6">
        {!csvLoading ? (
          <div>
            <CustomLabels eventData={data?.graphData} />
          </div>
        ) : null}

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
                {csvLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      Loading event data...
                    </td>
                  </tr>
                ) : data?.eventData?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center pl-36 text-gray-500">
                      No events found, try uploading one!
                    </td>
                  </tr>
                ) : (
                  sortedEventData?.map((event, index) => {
                    const checkIns = event.totalattendance || 0;
                    const rsvps = event.totalrsvps || 0;
                    const ratio = rsvps && rsvps > 0 ? Math.round((checkIns / rsvps) * 100) : 0;

                    return (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-3 ">
                          {index + 1} - {event.eventname}
                        </td>
                        <td className="px-4 py-3 ">{formatDateForChart(event.eventdate)}</td>
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
