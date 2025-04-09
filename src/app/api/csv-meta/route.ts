import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with server-side credentials
// This runs on the server, so environment variables are safe here
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const payload = await request.json();

    // Extract the auth token from request headers
    const authHeader = request.headers.get("Authorization");

    // Call the Supabase Edge Function
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/csv-to-meta`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Pass through the auth token if available
          ...(authHeader && { Authorization: authHeader }),
        },
        body: JSON.stringify(payload),
      }
    );

    // Check for errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Edge function error: ${response.status}`, errorText);
      return NextResponse.json(
        { error: `Error from Edge Function: ${response.status}` },
        { status: response.status }
      );
    }

    // Return the successful response
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Server error in csv-meta API route:", error);
    return NextResponse.json(
      { error: "Internal server error in API route" },
      { status: 500 }
    );
  }
}
