import { supabase } from '@/lib/supabase/client';
import { CsvMetaPayload } from '@/types/payloads';

/**
 * Sends a request to the "csv-to-meta" Edge Function with the provided payload.
 *
 * @param payload - An object containing the necessary information to process the CSV metadata.
 * @throws Will throw an error if the user is not authenticated or if required fields are missing from the payload.
 * @returns An object containing the response data and any error information from the Edge Function.
 */
export const csvToMeta = async (payload: CsvMetaPayload) => {
  try {
    console.log('Calling csvToMeta with payload:', JSON.stringify(payload, null, 2));

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('No authentication token available - please log in');
    }

    console.log('Session token available, calling Edge Function');

    // Verify all required fields are present and have valid values
    if (!payload.bucket) throw new Error("Missing 'bucket' field in payload");
    if (!payload.path) throw new Error("Missing 'path' field in payload");
    if (!payload.userid) throw new Error("Missing 'userid' field in payload");
    if (!payload.eventid) throw new Error("Missing 'eventid' field in payload");
    if (!payload.eventname) throw new Error("Missing 'eventname' field in payload");
    if (!payload.eventdate) throw new Error("Missing 'eventdate' field in payload");

    const { data, error } = await supabase.functions.invoke('csv-to-meta', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: payload,
    });

    console.log('Edge Function response:', { data, error });

    if (error) {
      console.error('Edge Function returned an error:', error);
      // Log more details about the error if available
      if (error.message) console.error('Error message:', error.message);
      if (error.status) console.error('Error status:', error.status);
      if (error.details) console.error('Error details:', error.details);
    }

    return { data, error };
  } catch (err) {
    console.error('Error in csvToMeta function:', err);
    return {
      data: null,
      error: {
        message:
          err instanceof Error
            ? `Failed to send a request to the Edge Function: ${err.message}`
            : 'Failed to send a request to the Edge Function',
      },
    };
  }
};
