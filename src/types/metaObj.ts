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
