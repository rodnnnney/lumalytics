'use client';

import { userObject } from '@/types/metaObj';
import NumberFlow from '@number-flow/react';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef, useMemo } from 'react';
import { fetchReoccuring } from '@/lib/supabase/queries/fetchreoccuring';
import { useAuth } from '@/context/AuthContext';

export default function Users() {
  const [sortField, setSortField] = useState('alpha');
  const [sortDirection, setSortDirection] = useState('desc');
  const isInitialMount = useRef(true);
  const { user, loading: authLoading } = useAuth();

  const fetchAllUsers = async (): Promise<userObject[]> => {
    if (!user) {
      console.log('[fetchAllUsers] User context not ready.');
      return [];
    }

    console.log('[fetchAllUsers] Starting fetch for user ID:', user.id);

    try {
      const usersData = await fetchReoccuring(user.id);

      if (!usersData) {
        console.log('No user data returned.');
        return [];
      }

      return usersData.map((userData: userObject) => ({
        all_custom_data: userData.all_custom_data,
        all_feedback_structured: userData.all_feedback_structured,
        average_rating: userData.average_rating,
        checked_in_event_names_array: userData.checked_in_event_names_array,
        checked_in_event_names_string: userData.checked_in_event_names_string,
        cleaned_email: userData.cleaned_email,
        count_events_approved_not_checked_in: userData.count_events_approved_not_checked_in,
        count_events_declined: userData.count_events_declined,
        count_events_invited: userData.count_events_invited,
        count_events_waitlisted: userData.count_events_waitlisted,
        created_at: userData.created_at,
        first_checkin_date: userData.first_checkin_date,
        first_name_guess: userData.first_name_guess,
        last_checkin_date: userData.last_checkin_date,
        last_name_guess: userData.last_name_guess,
        name: userData.name,
        total_events_checked_in: userData.total_events_checked_in,
        updated_at: userData.updated_at,
        userid: userData.userid,
      }));
    } catch (fetchError) {
      console.error('Error fetching reoccurring users:', fetchError);
      throw fetchError;
    }
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ['users', user?.id],
    queryFn: fetchAllUsers,
    staleTime: Infinity,
    gcTime: 1 * 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !!user && !authLoading,
  });

  useEffect(() => {
    const savedSortField = localStorage.getItem('userSortField');
    const savedSortDirection = localStorage.getItem('userSortDirection');

    console.log('[Users Initial Load] Reading from localStorage:', {
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
      console.log('[Users State Change] Writing to localStorage:', { sortField, sortDirection });
      localStorage.setItem('userSortField', sortField);
      localStorage.setItem('userSortDirection', sortDirection);
    }
  }, [sortField, sortDirection]);

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;

    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  const handleSortToggle = (field: string) => {
    console.log(`[Users Sort Toggle] Clicked field: ${field}. Current state:`, {
      sortField,
      sortDirection,
    });
    if (sortField === field) {
      setSortDirection(prev => {
        const nextDirection = prev === 'asc' ? 'desc' : 'asc';
        console.log(`[Users Sort Toggle] Toggling direction for ${field} to: ${nextDirection}`);
        return nextDirection;
      });
    } else {
      console.log(`[Users Sort Toggle] Setting new field: ${field}, direction: desc`);
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortedEventData = () => {
    if (!Array.isArray(data) || data.length === 0) return [];

    return [...data].sort((a, b) => {
      let valA, valB;

      switch (sortField) {
        case 'events_check_in':
          valA = Number(a.total_events_checked_in) || 0;
          valB = Number(b.total_events_checked_in) || 0;
          return sortDirection === 'asc' ? valA - valB : valB - valA;

        case 'events_approved':
          valA = Number(a.count_events_approved_not_checked_in) || 0;
          valB = Number(b.count_events_approved_not_checked_in) || 0;

          return sortDirection === 'asc' ? valA - valB : valB - valA;

        case 'alpha':
          valA = a.name || '';
          valB = b.name || '';

          return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);

        case 'email':
          valA = a.cleaned_email || '';
          valB = b.cleaned_email || '';

          return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);

        default:
          return 0;
      }
    });
  };

  const sortedUserAnalytics = useMemo(() => {
    return getSortedEventData();
  }, [data, sortField, sortDirection]);

  return (
    <div>
      <p className="p-4 inline-block w-fit bg-gradient-to-r from-[#7195e8] to-[#f27676] bg-clip-text text-2xl font-bold text-transparent">
        Attendees
      </p>

      {isLoading ? (
        <div className="w-full h-[80vh] flex items-center justify-center">
          <div className="loader"></div>
        </div>
      ) : (
        <></>
      )}

      {isLoading ? (
        <></>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">#</th>

                <th
                  className="px-4 py-3 text-left font-medium text-gray-700"
                  onClick={() => handleSortToggle('alpha')}
                >
                  Name
                  {renderSortIcon('alpha')}
                </th>
                <th
                  className="px-4 py-3 text-left font-medium text-gray-700"
                  onClick={() => handleSortToggle('email')}
                >
                  Email
                  {renderSortIcon('email')}
                </th>
                <th
                  className="px-4 py-3 text-left font-medium text-gray-700"
                  onClick={() => handleSortToggle('events_check_in')}
                >
                  Events Checked In
                  {renderSortIcon('events_check_in')}
                </th>
                <th
                  className="px-4 py-3 text-left font-medium text-gray-700"
                  onClick={() => handleSortToggle('events_approved')}
                >
                  Events Approved
                  {renderSortIcon('events_approved')}
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
                sortedUserAnalytics.map((user, index) => (
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
      )}
    </div>
  );
}
