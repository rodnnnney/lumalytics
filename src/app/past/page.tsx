'use client';

import AddEventButton from '@/components/addEvent/AddEventButton';
import { supabase } from '@/lib/supabase/client';
import { fetchMeta } from '@/lib/supabase/queries/fetch';
import { fetchReoccuring } from '@/lib/supabase/queries/fetchreoccuring';
import { metadata, userObject } from '@/types/metaObj';
import { formatDateForChart } from '@/utils/format';
import { getReturningUsersCount } from '@/utils/timeCompare';
import { customUrlFormatter } from '@/utils/urlspacer';
import { useEffect, useState } from 'react';
import BasicPie from '@/components/graphs/SimplePie';
import SimpleLineChart from '@/components/graphs/LineGraph';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

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

          <p className="inline-block w-fit bg-gradient-to-r from-[#7195e8] to-[#f27676] bg-clip-text text-2xl font-bold text-transparent">
            Past Events
          </p>

          {sortedMetaData.length === 0 ? (
            <div className="w-full h-[80vh] flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl text-gray-500 mb-6">No past events found</div>
                <AddEventButton />
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 md:gap-6">
                <div className="justify-self-center flex items-center w-full h-[30vh]">
                  <SimpleLineChart
                    series1Data={sortedMetaData.map(event => {
                      const eventUsers = getUsersForEvent(event.eventname);
                      return getReturningUsersCount(eventUsers, event.eventdate);
                    })}
                    series1Label="Returning Attendees"
                    series2Data={sortedMetaData.map(event => {
                      const eventUsers = getUsersForEvent(event.eventname);
                      const returningUsersCount = getReturningUsersCount(
                        eventUsers,
                        event.eventdate
                      );
                      return eventUsers.length - returningUsersCount;
                    })}
                    series2Label="New Attendees"
                    xLabels={sortedMetaData.map(event => event.eventname)}
                    height={350}
                  />
                </div>

                <div className="justify-self-center flex items-center w-full h-[30vh]">
                  <BasicPie
                    data={[
                      {
                        id: 0,
                        value: sortedMetaData.reduce((sum, event) => {
                          const eventUsers = getUsersForEvent(event.eventname);
                          return sum + getReturningUsersCount(eventUsers, event.eventdate);
                        }, 0),
                        label: 'Returning Attendees',
                        color: '#f27676',
                      },
                      {
                        id: 1,
                        value: sortedMetaData.reduce((sum, event) => {
                          const eventUsers = getUsersForEvent(event.eventname);
                          const returningUsersCount = getReturningUsersCount(
                            eventUsers,
                            event.eventdate
                          );
                          return sum + (eventUsers.length - returningUsersCount);
                        }, 0),
                        label: 'New Attendees',
                        color: '#7195e8',
                      },
                    ]}
                  />
                </div>
              </div>

              {sortedMetaData.map(event => {
                const eventUsers = getUsersForEvent(event.eventname);

                const returningUsersCount = getReturningUsersCount(eventUsers, event.eventdate);

                interface FeedbackItem {
                  rating: string;
                  response: string;
                  eventname: string;
                }

                const eventFeedback = eventUsers.reduce<FeedbackItem[]>((feedbackList, user) => {
                  if (user.all_feedback_structured && Array.isArray(user.all_feedback_structured)) {
                    const feedbackArray = user.all_feedback_structured as FeedbackItem[];
                    const eventSpecificFeedback = feedbackArray
                      .filter(feedback => feedback.eventname === event.eventname)
                      .map(feedback => ({
                        ...feedback,
                        userName:
                          user.name ||
                          `${user.first_name_guess || ''} ${user.last_name_guess || ''}`.trim() ||
                          user.cleaned_email ||
                          'Anonymous',
                      }));
                    return [...feedbackList, ...eventSpecificFeedback];
                  }
                  return feedbackList;
                }, []);

                const recurringAttendeesCount = eventUsers.length - returningUsersCount;

                return (
                  <div key={event.id}>
                    <div className="mb-6 rounded-xl p-8 border border-gray-200">
                      <div className="  ">
                        <div className="flex justify-between ">
                          <div className="inline-block w-fit bg-gradient-to-r from-luma-blue to-[#f27676] bg-clip-text text-2xl font-bold text-transparent">
                            {event.eventname}
                          </div>

                          <div className="relative group cursor-pointer">
                            <div
                              onClick={() => {
                                const csvurl = customUrlFormatter(event.filepath.split('/'));
                                window.open(csvurl, '_blank');
                              }}
                            >
                              <div className="gap-2 transition-colors duration-300 ease-in-out hover:bg-gray-400 hover:text-white py-2 px-4 rounded">
                                Download <FontAwesomeIcon icon={faDownload} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-500 mt-1">{formatDateForChart(event.eventdate)}</p>
                      </div>

                      <div className="w-full">
                        <div className="grid grid-cols-2 gap-4 w-full h-full">
                          <div className="row-span-2 rounded-xl shadow-sm px-6 py-4 w-full h-full flex flex-col">
                            <h2 className="font-bold text-xl mb-4">Attendee Breakdown</h2>
                            <div className="mt-4 flex-grow flex items-center justify-center">
                              <BasicPie
                                data={[
                                  {
                                    id: 0,
                                    value: returningUsersCount,
                                    label: 'Returning',
                                    color: '#f27676',
                                  },
                                  {
                                    id: 1,
                                    value: recurringAttendeesCount,
                                    label: 'New',
                                    color: '#7195e8',
                                  },
                                ]}
                              />
                            </div>
                          </div>

                          <div className="rounded-xl shadow-sm px-6 py-4 w-full flex flex-col">
                            <h2 className="font-bold text-xl mb-2">
                              {event.totalattendance} - {event.totalrsvps}
                            </h2>
                            <p className="text-gray-700">Attendees vs RSVP</p>
                          </div>

                          <div className="rounded-xl shadow-sm px-6 py-4 w-full flex flex-col">
                            <h2 className="font-bold text-xl mb-2">
                              {returningUsersCount} - {recurringAttendeesCount}
                            </h2>
                            <p className="text-gray-700">Returning vs New</p>
                          </div>

                          <div className="rounded-xl shadow-sm px-6 py-4 w-full flex flex-col">
                            <h2 className="font-bold text-xl mb-2">HI</h2>
                            <p className="text-gray-700">Average checkin time</p>
                          </div>

                          <div className="rounded-xl shadow-sm px-6 py-4 w-full flex flex-col">
                            <h2 className="font-bold text-xl mb-2">
                              {eventFeedback.length > 0
                                ? `${eventFeedback.length} ${eventFeedback.length === 1 ? 'Review' : 'Reviews'}`
                                : 'No Reviews'}
                            </h2>
                            <p className="text-gray-700">Reviews and Responses</p>
                            {eventFeedback.length > 0 && (
                              <div className="mt-3 max-h-32 overflow-y-auto">
                                {eventFeedback.map((feedback: FeedbackItem, index: number) => (
                                  <div
                                    key={index}
                                    className="mb-2 p-2 bg-gray-50 rounded-md relative group"
                                  >
                                    <div className="flex items-center mb-1">
                                      <span className="text-yellow-500 mr-1">
                                        {'★'.repeat(parseInt(feedback.rating) || 0)}
                                      </span>
                                      <span className="text-gray-400 text-sm">
                                        ({feedback.rating}/5)
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                      {feedback.response === '' ? '' : feedback.response}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
