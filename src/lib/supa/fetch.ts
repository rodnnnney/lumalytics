import { supabase } from "./fetchAllTables";

/**
 * Fetches users who have checked in for a specific event
 * @param tableName Name of the event table to query
 * @returns Array of users who have checked in (with non-empty checked_in_at)
 */
export async function fetchCheckedInUsers(tableName: string) {
  const { data, error } = await supabase
    .from(`"${tableName}"`) // Double quotes handle table names with spaces
    .select("checked_in_at,api_id")
    .eq("approval_status", "approved")
    .neq("checked_in_at", ""); // Only get users who have checked in

  if (error) {
    console.error("Error fetching checked in users:", error);
    return [];
  }
  console.log("[info]", data);
  return data;
}

/**
 * Fetches all approved reservations for a specific event
 * @param tableName Name of the event table to query
 * @returns Array of all approved reservations
 */
export async function fetchAllReservationsCount(tableName: string) {
  const { data, error } = await supabase
    .from(`"${tableName}"`)
    .select("api_id")
    .eq("approval_status", "approved");

  if (error) {
    console.error("Error fetching all reservations:", error);
    return [];
  }
  return data;
}

/**
 * Identifies users who have reservations but haven't checked in yet
 * @param tableName Name of the event table to query
 * @returns Array of users with approved reservations who haven't checked in
 */
export async function fetchNotCheckedInUsers(tableName: string) {
  const [checkedIn, allReservations] = await Promise.all([
    fetchCheckedInUsers(tableName),
    fetchAllReservationsCount(tableName),
  ]);

  // Filter to find users who have reservations but haven't checked in
  const notCheckedIn = allReservations.filter(
    (reservation) =>
      !checkedIn.some(
        (checkedUser) => checkedUser.api_id === reservation.api_id
      )
  );

  return notCheckedIn;
}
