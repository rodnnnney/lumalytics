import supabase from "@/lib/supa/supa";
import { CsvAttendeesPayload } from "@/types/payloads";



export async function fetchCsvAttendees(params: CsvAttendeesPayload) {
  const { bucket, path, userid, eventid } = params;

  const payload: CsvAttendeesPayload = {
    bucket,
    path,
    userid,
    eventid,
  };

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("No authentication token available - please log in");
  }

  const url = "/api/supaEdge/api_routes/csv-attendees";

  try {
    console.log("Sending request to:", url);
    console.log("Using params:", { bucket, path, userid, eventid });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorDetail;
      try {
        errorDetail = await response.text();
      } catch (e) {
        errorDetail = "Could not extract error details";
      }

      throw new Error(
        `HTTP error! Status: ${response.status}, Details: ${errorDetail}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching CSV attendees:", error);

    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      console.error(
        "Network error - check your internet connection or if the Supabase function URL is correct"
      );
    }

    throw error;
  }
}
