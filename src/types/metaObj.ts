export interface ChartDataItem {
  date: string;
  Reservations: number;
  Attendees: number;
  eventName: string;
  month?: string; // Optional field for month display
  value?: number; // Optional field for generic value
}

export interface PieGraphDataItem {
  label: string;
  value: number;
  fill: string;
  title?: string;
  description?: string;
  trendingText?: string;
  footerText?: string;
}

// Interface for event data from Supabase
export interface EventData {
  id: string;
  eventname: string;
  totalattendance: number;
  totalrsvps: number;
  eventdate: string;
  userid: string;
  created_at?: string;
}

export interface metadata {
  created_at: string;
  eventdate: string;
  eventid: string;
  eventname: string;
  filepath: string;
  id: string;
  totalattendance: string;
  totalrsvps: string;
  userid: string;
}

export interface userObject {
  all_custom_data: Array<{ [key: string]: string }>;
  all_feedback_structured: null;
  average_rating: null;
  checked_in_event_names_array: Array<string>;
  checked_in_event_names_string: string;
  count_events_approved_not_checked_in: string;
  count_events_declined: string;
  count_events_invited: string;
  count_events_waitlisted: string;
  created_at: string;
  first_checkin_date: string;
  first_name_guess: string;
  last_checkin_date: string;
  last_name_guess: string;
  name: string;
  total_events_checked_in: string;
  updated_at: string;
  userid: string;
  cleaned_email: string;
}
