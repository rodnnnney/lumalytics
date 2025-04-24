'use client';

import { userObject } from '@/types/metaObj';
import NumberFlow from '@number-flow/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { fetchReoccuring } from '@/lib/supabase/queries/fetchreoccuring';

export default function Users() {
  const [sortField, setSortField] = useState('alpha');
  const [sortDirection, setSortDirection] = useState('desc');
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     const { data, error } = await supabase.auth.getUser();

  //     if (error) return;

  //     const users = await fetchReoccuring(data.user?.id);

  //     setUserAnalytics(
  //     users.map(user => ({
  //       all_custom_data: user.all_custom_data,
  //       all_feedback_structured: user.all_feedback_structured,
  //       average_rating: user.average_rating,
  //       checked_in_event_names_array: user.checked_in_event_names_array,
  //       checked_in_event_names_string: user.checked_in_event_names_string,
  //       cleaned_email: user.cleaned_email,
  //       count_events_approved_not_checked_in: user.count_events_approved_not_checked_in,
  //       count_events_declined: user.count_events_declined,
  //       count_events_invited: user.count_events_invited,
  //       count_events_waitlisted: user.count_events_waitlisted,
  //       created_at: user.created_at,
  //       first_checkin_date: user.first_checkin_date,
  //       first_name_guess: user.first_name_guess,
  //       last_checkin_date: user.last_checkin_date,
  //       last_name_guess: user.last_name_guess,
  //       name: user.name,
  //       total_events_checked_in: user.total_events_checked_in,
  //       updated_at: user.updated_at,
  //       userid: user.userid,

  const fetchAllUsers = async (): Promise<userObject[]> => {
    const { user } = await supabase.auth.getUser();
    console.log('Auth data:', user);

    const { data } = await fetchReoccuring(user.user.id || 'Hello');
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    console.log('Fetched users:', data);

    return data.map(user => ({
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
    }));
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchAllUsers,
    staleTime: Infinity, // Keep data fresh forever until manually invalidated
    gcTime: 1 * 60 * 60 * 1000, // Store in cache for 1 hours
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !userLoading, // Enable the query once we know auth state (whether user is logged in or not)
  });

  // useEffect(() => {
  //   const savedSortField = localStorage.getItem('eventSortFieldUsers');
  //   const savedSortDirection = localStorage.getItem('eventSortDirectionUsers');

  //   if (savedSortField) setSortField(savedSortField);
  //   if (savedSortDirection) setSortDirection(savedSortDirection);

  //   console.log('[Users] Saved sort field', savedSortField, savedSortDirection);
  // }, []);

  // useEffect(() => {
  //   localStorage.setItem('eventSortFieldUsers', sortField);
  //   localStorage.setItem('eventSortDirectionUsers', sortDirection);
  //   console.log('[Users] Saving sort preferences', sortField, sortDirection);
  // }, [sortField, sortDirection]);

  // const renderSortIcon = (field: string) => {
  //   if (sortField !== field) return null;

  //   return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  // };

  // const getSortedEventData = () => {
  //   if (!Array.isArray(data) || data.length === 0) return [];

  //   return [...data].sort((a, b) => {
  //     let valA, valB;

  //     switch (sortField) {
  //       case 'events_check_in':
  //         valA = Number(a.total_events_checked_in) || 0;
  //         valB = Number(b.total_events_checked_in) || 0;
  //         return sortDirection === 'asc' ? valA - valB : valB - valA;

  //       case 'events_approved':
  //         valA = Number(a.count_events_approved_not_checked_in) || 0;
  //         valB = Number(b.count_events_approved_not_checked_in) || 0;

  //         return sortDirection === 'asc' ? valA - valB : valB - valA;

  //       case 'alpha':
  //         valA = a.name || '';
  //         valB = b.name || '';

  //         return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);

  //       case 'email':
  //         valA = a.cleaned_email || '';
  //         valB = b.cleaned_email || '';

  //         return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);

  //       default:
  //         return 0;
  //     }
  //   });
  // };

  // const handleSortToggle = (field: string) => {
  //   console.log(`Sort Field: ${field}, Sort Direction: ${sortDirection}`);
  //   if (sortField === field) {
  //     setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
  //   } else {
  //     setSortField(field);
  //     setSortDirection('desc');
  //   }
  // };

  // const sortedUserAnalytics = getSortedEventData();

  return (
    <div>
      <p className="p-4 inline-block w-fit bg-gradient-to-r from-[#7195e8] to-[#f27676] bg-clip-text text-2xl font-bold text-transparent">
        Attendees
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">#</th>

              <th
                className="px-4 py-3 text-left font-medium text-gray-700"
                // onClick={() => handleSortToggle('alpha')}
              >
                Name
                {/* {renderSortIcon('alpha')} */}
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-700"
                // onClick={() => handleSortToggle('email')}
              >
                Email
                {/* {renderSortIcon('email')} */}
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-700"
                // onClick={() => handleSortToggle('events_check_in')}
              >
                Events Checked In
                {/* {renderSortIcon('events_check_in')} */}
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-700"
                // onClick={() => handleSortToggle('events_approved')}
              >
                Events Approved
                {/* {renderSortIcon('events_approved')} */}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-3 text-center">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-4 py-3 text-center">
                  Error loading data
                </td>
              </tr>
            ) : !data || data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-3 text-center">
                  No users found
                </td>
              </tr>
            ) : (
              data.map((user, index) => (
                <tr key={user.cleaned_email} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{index + 1}</td>
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3">{user.cleaned_email}</td>
                  <td className="px-4 py-3">
                    <NumberFlow value={Number(user.total_events_checked_in)} />
                  </td>
                  <td className="px-4 py-3">
                    <NumberFlow value={Number(user.count_events_approved_not_checked_in)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
