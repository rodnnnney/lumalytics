import { fetchAllReservationsCount, fetchCheckedInUsers } from "./fetch";
import { getAllTables, supabase } from "./fetchAllTables";

export async function putMetaData(tableName: string) {
  const checkedInUsers = await fetchCheckedInUsers(tableName);
  const allReservations = await fetchAllReservationsCount(tableName);

  const { data, error } = await supabase.from("MetaTable").upsert(
    {
      event_time: checkedInUsers[0]?.checked_in_at || new Date().toISOString(),
      event_name: tableName,
      reservations: allReservations.length,
      attendees: checkedInUsers.length,
    },
    {
      onConflict: "event_name",
    }
  );

  if (error) {
    console.error("Error inserting data:", error.message, error.details);
    throw error;
  }

  console.log("Data inserted:", data);
  const logData = {
    event_name: tableName,
    reservations: allReservations.length,
    attendees: checkedInUsers.length,
  };
  console.log("[info]", logData);
  return data;
}

export async function putAllMetaData() {
  const tables = await getAllTables();
  for (const table of tables) {
    await putMetaData(table);
  }
}
