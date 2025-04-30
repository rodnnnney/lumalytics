'use client';

import { userObject } from '@/types/metaObj';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchReoccuring } from '@/queries/fetch';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Users() {
  const [sortField, setSortField] = useState('alpha');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedUser, setSelectedUser] = useState<userObject | null>(null);
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
    staleTime: 5 * 60 * 1000,
    gcTime: 1 * 60 * 60 * 1000,
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

  // 1. no user -> click then open
  // 2. yes user -> click them selves -> nothing
  // 3. yes user -> click another -> close then re

  const handleUserClick = (userData: userObject) => {
    console.log(userData);
    // If the clicked user IS the currently selected user...
    if (selectedUser?.userid === userData.userid) {
      setSelectedUser(null); // ...close the sidebar by setting selectedUser to null.
      console.log('[handleUserClick] Deselected user:', userData.name);
      return; // Exit
    }

    // Otherwise (if no user is selected OR a *different* user is clicked)...
    setSelectedUser(userData); // ...set the clicked user as selected.
    // This will either open the sidebar (if null before)
    // or update the content (if a different user was selected).
    console.log('[handleUserClick] Selected user:', userData.name);
  };
  const sortedUserAnalytics = useMemo(() => {
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
  }, [data, sortField, sortDirection]);

  return (
    <div>
      <ToastContainer />
      <div className="w-full min-h-screen">
        <p className="pb-4 inline-block w-fit bg-gradient-to-r from-[#7195e8] to-[#f27676] bg-clip-text text-2xl font-bold text-transparent">
          Attendees
        </p>

        <div className="flex overflow-hidden">
          <div
            className={`w-80 bg-white shadow-lg border-l border-gray-200 transition-all duration-300 transform ${
              selectedUser ? 'translate-x-0' : 'translate-x-full'
            } fixed top-0 right-0 h-full z-10 overflow-y-auto`}
          >
            {selectedUser && (
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">User Details</h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <h3 className="text-sm font-medium text-gray-500">Name</h3>
                    <div className="flex items-center">
                      <p className="text-gray-800 mr-2 cursor-pointer relative group">
                        <span
                          className="inline-block hover:text-luma-blue transition-colors transition-all duration-300"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedUser.name);
                            toast.success('Name copied to clipboard!', {
                              position: 'bottom-right',
                              autoClose: 2000,
                              hideProgressBar: false,
                              closeOnClick: true,
                              pauseOnHover: true,
                              draggable: true,
                            });
                          }}
                        >
                          {selectedUser.name}
                        </span>
                        <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-luma-blue transition-all duration-300 group-hover:w-full"></span>
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <div className="flex items-center">
                      <p className="text-gray-800 mr-2 cursor-pointer relative group">
                        <span
                          className="inline-block hover:text-luma-blue transition-colors transition-all duration-300"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedUser.cleaned_email);
                            toast.success('Email copied to clipboard!', {
                              position: 'bottom-right',
                              autoClose: 2000,
                              hideProgressBar: false,
                              closeOnClick: true,
                              pauseOnHover: true,
                              draggable: true,
                            });
                          }}
                        >
                          {selectedUser.cleaned_email}
                        </span>
                        <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-luma-blue transition-all duration-300 group-hover:w-full"></span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">First Check-in</h3>
                    <p className="text-gray-800">
                      {selectedUser.first_checkin_date
                        ? new Date(selectedUser.first_checkin_date).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Last Check-in</h3>
                    <p className="text-gray-800">
                      {selectedUser.last_checkin_date
                        ? new Date(selectedUser.last_checkin_date).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Events Statistics</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Checked In</p>
                        <p className="font-bold">{selectedUser.total_events_checked_in || 0}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Approved</p>
                        <p className="font-bold">
                          {selectedUser.count_events_approved_not_checked_in || 0}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Invited</p>
                        <p className="font-bold">{selectedUser.count_events_invited || 0}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500">Declined</p>
                        <p className="font-bold">{selectedUser.count_events_declined || 0}</p>
                      </div>
                    </div>
                  </div>

                  {selectedUser.checked_in_event_names_array &&
                    selectedUser.checked_in_event_names_array.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Events Attended</h3>
                        <ul className="mt-2 space-y-1 text-gray-800">
                          {selectedUser.checked_in_event_names_array.map((eventName, index) => (
                            <li key={index} className="bg-gray-50 p-2 rounded text-sm">
                              {eventName}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {Object.entries(selectedUser.all_custom_data).map(([key, value]) => {
                    if (key === '' || !value || typeof value !== 'object') return null;
                    const eventData = value;
                    if (
                      !eventData.custom_fields ||
                      !Object.values(eventData.custom_fields).some(field => field !== null)
                    )
                      return null;
                    return (
                      <div key={key} className="bg-gray-50 p-3 rounded mb-3">
                        <h4 className="text-xs font-medium text-gray-500 mb-2">Custom Fields:</h4>
                        <div className="pl-2">
                          {Object.entries(eventData.custom_fields).map(([fieldKey, fieldValue]) => {
                            if (fieldValue === null) return null;
                            return (
                              <p key={fieldKey} className="text-sm text-gray-800">
                                <span className="font-medium">{fieldKey}:</span>{' '}
                                {typeof fieldValue === 'string' &&
                                fieldValue.match(/^https?:\/\//) ? (
                                  <a
                                    href={fieldValue}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                  >
                                    {fieldValue}
                                  </a>
                                ) : (
                                  fieldValue
                                )}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {selectedUser.average_rating && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
                      <p className="text-gray-800 font-bold">
                        {`${Number(selectedUser.average_rating).toFixed(1)}/5`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className={`flex-1 transition-all duration-300 ${selectedUser ? 'pr-80' : 'pr-0'}`}>
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
                        <td colSpan={5} className="px-12 py-3 text-center ">
                          <div className="flex justify-center">No users found</div>
                        </td>
                      </tr>
                    ) : (
                      sortedUserAnalytics.map((user, index) => (
                        <tr
                          key={user.cleaned_email}
                          className="border-t hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleUserClick(user)}
                        >
                          <td className="px-4 py-3 font-medium">{index + 1}</td>
                          <td className="px-4 py-3 font-medium">{user.name}</td>
                          <td className="px-4 py-3">{user.cleaned_email}</td>
                          <td className="px-4 py-3">{user.total_events_checked_in}</td>
                          <td className="px-4 py-3">{user.count_events_approved_not_checked_in}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
