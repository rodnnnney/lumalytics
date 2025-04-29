import { supabase } from "@/lib/supabase/client";
import { CsvAttendeesPayload } from "@/types/payloads";

export const csvToAttendees = async (payload: CsvAttendeesPayload) => {
  try {
    console.log(
      "csvToAttendees called with payload:",
      JSON.stringify(payload, null, 2)
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("No authentication token available - please log in");
    }

    console.log("Session token available, calling Edge Function");

    // Verify all required fields are present
    if (!payload.bucket) throw new Error("Missing 'bucket' field in payload");
    if (!payload.path) throw new Error("Missing 'path' field in payload");
    if (!payload.userid) throw new Error("Missing 'userid' field in payload");
    if (!payload.eventid) throw new Error("Missing 'eventid' field in payload");

    const { data, error } = await supabase.functions.invoke("csv-attendees", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: payload,
    });

    console.log("Edge Function response:", { data, error });

    if (error) {
      console.error("Edge Function returned an error:", error);
      // Log more details about the error if available
      if (error.message) console.error("Error message:", error.message);
      if (error.status) console.error("Error status:", error.status);
      if (error.details) console.error("Error details:", error.details);
    }

    return { data, error };
  } catch (err) {
    console.error("Error in csvToAttendees function:", err);
    return {
      data: null,
      error: {
        message:
          err instanceof Error
            ? `Failed to send a request to the Edge Function: ${err.message}`
            : "Failed to send a request to the Edge Function",
      },
    };
  }
};
