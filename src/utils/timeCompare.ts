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

/**
 * Interface for check-in time statistics
 */
export interface CheckinTimeStats {
  average: string;
  earliest: string;
  latest: string;
}

/**
 * Calculates check-in time statistics (average, earliest, latest) for a group of users
 * @param userAnalytics - Array of user objects to analyze
 * @returns An object containing average, earliest, and latest check-in times
 */
export const getCheckinTimeStats = (userAnalytics: userObject[]): CheckinTimeStats => {
  const defaultResponse = {
    average: 'N/A',
    earliest: 'N/A',
    latest: 'N/A',
  };

  if (!userAnalytics || userAnalytics.length === 0) {
    return defaultResponse;
  }

  // Extract check-in timestamps from user data
  const checkinTimes = userAnalytics
    .map(user => new Date(user.first_checkin_date))
    .filter(date => !isNaN(date.getTime())); // Filter out invalid dates

  if (checkinTimes.length === 0) {
    return defaultResponse;
  }

  // Convert each time to minutes since midnight for easier calculations in Eastern Time
  const minutesSinceMidnight = checkinTimes.map(date => {
    // Get the local hours and minutes in the Eastern timezone
    // We use the fact that first_checkin_date already has timezone info in ISO format
    return date.getHours() * 60 + date.getMinutes();
  });

  // Calculate statistics
  const totalMinutes = minutesSinceMidnight.reduce((sum, minutes) => sum + minutes, 0);
  const averageMinutes = Math.round(totalMinutes / minutesSinceMidnight.length);
  const earliestMinutes = Math.min(...minutesSinceMidnight);
  const latestMinutes = Math.max(...minutesSinceMidnight);

  // Helper function to format minutes since midnight to a time string
  const formatTimeFromMinutes = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    const displayMinutes = minutes.toString().padStart(2, '0');

    return `${displayHours}:${displayMinutes} ${period}`;
  };

  return {
    average: formatTimeFromMinutes(averageMinutes),
    earliest: formatTimeFromMinutes(earliestMinutes),
    latest: formatTimeFromMinutes(latestMinutes),
  };
};
