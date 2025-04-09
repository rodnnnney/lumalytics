// TypeScript code to call the Supabase function
import supabase from "@/lib/supa/supa";
import { ApiResponse, CsvMetaPayload } from "@/types/payloads";

async function metaToCsv(
  bucket: string,
  path: string,
  userid: string,
  eventid: string,
  eventname: string,
  eventdate: string
): Promise<ApiResponse> {
  const url = "/api/supaEdge/api_routes/csv-meta";

  console.log("Using API route:", url);

  const payload: CsvMetaPayload = {
    bucket,
    path,
    userid,
    eventid,
    eventname,
    eventdate,
  };

  console.log("Payload:", payload);

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("No authentication token available - please log in");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };

  try {
    console.log("Making fetch request to API route...");
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", response.status, errorText);
      throw new Error(
        `HTTP error! Status: ${response.status}, Details: ${errorText}`
      );
    }

    const data: ApiResponse = await response.json();
    console.log("Response:", data);
    return data;
  } catch (error) {
    console.error("Error calling API route:", error);

    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    throw error;
  }
}

export default metaToCsv;
