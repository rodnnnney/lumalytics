export interface CsvMetaPayload {
  bucket: string;
  path: string;
  userid: string;
  eventid: string;
  eventname: string;
  eventdate: string;
}

export interface ApiResponse {
  message?: string;
  error?: string;
}
