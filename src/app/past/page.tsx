'use client';

import { supabase } from '@/lib/supabase/client';
import { fetchMeta } from '@/lib/supabase/queries/fetch';
import { fetchReoccuring } from '@/lib/supabase/queries/fetchreoccuring';
import { metadata, userObject } from '@/types/metaObj';
import { formatDateForChart } from '@/util/format';
import { getReturningUsersCount } from '@/util/timeCompare';
import { customUrlFormatter } from '@/util/urlspacer';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Component for the Pie Chart
function PieChartComponent({
  returningCount,
  newCount,
}: {
  returningCount: number;
  newCount: number;
}) {
  const data = [
    { name: 'Old', value: returningCount },
    { name: 'New', value: newCount },
  ];

  const COLORS = ['#0088FE', '#00C49F'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default function Past() {
  const [metaData, setMetaData] = useState<metadata[]>([]);
  const [userAnalytics, setUserAnalytics] = useState<userObject[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) return;

      const users = await fetchReoccuring(data.user?.id);

      setUserAnalytics(
        users.map(user => ({
          all_custom_data: user.all_custom_data,
          all_feedback_structured: user.all_feedback_structured,
          average_rating: user.average_rating,
          checked_in_event_names_array: user.checked_in_event_names_array,
          checked_in_event_names_string: user.checked_in_event_names_string,
          cleaned_email: user.cleaned_email,
          count_events_approved_not_checked_in: user.count_events_approved_not_checked_in,
          count_events_declined: user.count_events_declined,
          count_events_invited: user.count_events_invited,
          count_events_waitlisted: user.count_events_waitlisted,
          created_at: user.created_at,
          first_checkin_date: user.first_checkin_date,
          first_name_guess: user.first_name_guess,
          last_checkin_date: user.last_checkin_date,
          last_name_guess: user.last_name_guess,
          name: user.name,
          total_events_checked_in: user.total_events_checked_in,
          updated_at: user.updated_at,
          userid: user.userid,
        }))
      );
    };
    fetchUser();
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
    };
    fetchUser();
  }, []);

  const sortMetaData = () => {
    return [...metaData].sort((a, b) => {
      return new Date(a.eventdate).getTime() - new Date(b.eventdate).getTime();
    });
  };

  const sortedMetaData = sortMetaData();

  const getUsersForEvent = (eventName: string) => {
    return userAnalytics.filter(user => {
      if (
        !user ||
        !user.checked_in_event_names_array ||
        !Array.isArray(user.checked_in_event_names_array)
      ) {
        return false;
      }
      return user.checked_in_event_names_array.includes(eventName);
    });
  };

  return (
    <div>
      <div className="w-full min-h-screen">
        <div className="flex flex-col gap-6 p-4">
          <div className="flex justify-between items-center w-full"></div>

          <p className="inline-block w-fit bg-gradient-to-r from-[#7195e8] to-[#f27676] bg-clip-text text-3xl font-bold text-transparent mb-8">
            Past Events
          </p>

          {sortedMetaData.map(event => {
            const eventUsers = getUsersForEvent(event.eventname);

            const returningUsersCount = getReturningUsersCount(eventUsers, event.eventdate);

            const recurringAttendeesCount = eventUsers.length - returningUsersCount;

            console.log(`${event.eventname}: ${returningUsersCount} returning users`);

            return (
              <div key={event.id} className="mb-8 bg-gray-100 rounded-xl p-8">
                <div className="flex justify-between mb-4">
                  <div className="py-2 px-4 rounded-lg flex items-baseline bg-gray-100">
                    {event.eventname} - {formatDateForChart(event.eventdate)}
                  </div>
                  <div
                    className="py-2 px-4 rounded-lg flex items-center gap-2 bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors"
                    onClick={() => {
                      const csvurl = customUrlFormatter(event.filepath.split('/'));
                      window.open(csvurl, '_blank');
                    }}
                  >
                    <span>Download CSV</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </div>
                </div>

                <div className="w-full">
                  <div className="grid grid-cols-2 gap-4 w-full h-full">
                    <div className="row-span-2 bg-blue-100 rounded-xl shadow-md px-6 py-4 w-full h-full flex flex-col">
                      <h2 className="font-bold text-xl mb-4">Attendee Breakdown</h2>
                      <p className="text-gray-700">Distribution of returning vs. new attendees</p>
                      <div className="mt-4 flex-grow flex items-center justify-center">
                        <PieChartComponent
                          returningCount={returningUsersCount}
                          newCount={recurringAttendeesCount}
                        />
                      </div>
                    </div>

                    <div className="rounded-xl shadow-md px-6 py-4 w-full flex flex-col">
                      <h2 className="font-bold text-xl mb-2">
                        {event.totalattendance} - {event.totalrsvps}
                      </h2>
                      <p className="text-gray-700">Attendees vs RSVP</p>
                    </div>

                    <div className="rounded-xl shadow-md px-6 py-4 w-full flex flex-col">
                      <h2 className="font-bold text-xl mb-2">
                        {returningUsersCount} - {recurringAttendeesCount}
                      </h2>
                      <p className="text-gray-700">Returning vs New</p>
                    </div>

                    <div className="rounded-xl shadow-md px-6 py-4 w-full flex flex-col">
                      <h2 className="font-bold text-xl mb-2">INFO HERE</h2>
                      <p className="text-gray-700">Average checkin time</p>
                    </div>

                    <div className="rounded-xl shadow-md px-6 py-4 w-full flex flex-col">
                      <h2 className="font-bold text-xl mb-2">INFO HERE</h2>
                      <p className="text-gray-700">Reviews and Responses</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
