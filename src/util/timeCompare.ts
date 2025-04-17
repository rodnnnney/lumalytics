import { userObject } from '@/types/metaObj';
import { formatDateForChart } from './format';

/**
 * Returns the count of users whose first check-in date was before a specified date
 * and who have attended more than one event (making them returning users)
 * @param userAnalytics - Array of user objects to analyze
 * @param targetDate - The date to compare against (users who checked in before this date) - can be Date object or string in format 'YYYY-MM-DD'
 * @returns The number of users who first checked in before the target date and have attended multiple events
 */
export const getReturningUsersCount = (userAnalytics: userObject[], targetDate: string) => {
  // Ensure targetDate is properly formatted as YYYY-MM-DD
  const targetDateObj = new Date(formatDateForChart(targetDate));
  targetDateObj.setHours(0, 0, 0, 0); // Set to beginning of the day for consistent comparison

  // For a user to be "returning" they must:
  // 1. Have their first check-in date before the target event date
  // 2. Have attended more than one event (total_events_checked_in > 1)
  return userAnalytics.filter(user => {
    // Parse the first_checkin_date properly
    // Handle ISO format strings like '2025-04-07 19:30:00+00'
    const firstCheckinDate = new Date(user.first_checkin_date);

    // Get the total number of events this user has attended
    const totalEventsAttended = parseInt(user.total_events_checked_in, 10) || 0;

    // console.log(
    //   `User ${user.name}: first check-in ${user.first_checkin_date} -> ${firstCheckinDate.toISOString()}, ` +
    //     `target date ${targetDate} -> ${targetDateObj.toISOString()}, ` +
    //     `total events attended: ${totalEventsAttended}`
    // );

    // A user is only "returning" if they've attended multiple events
    // AND their first check-in was before this event
    return firstCheckinDate < targetDateObj && totalEventsAttended > 1;
  }).length;
};
