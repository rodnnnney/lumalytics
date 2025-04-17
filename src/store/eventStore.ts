import {create} from "zustand/index";

interface EventStore {
    isLoading: boolean;
    isError: boolean;
    recurringGuests: string[];
    RSVP: string[];
    Attendees: string[];
    Responses: string[];
    Surveys: string[];

}
export const useEventStore = create<EventStore>((set, get) => ({
    isLoading: false,
    isError: false,
    recurringGuests: [],
    RSVP: [],
    Attendees: [],
    Responses: [],
    Surveys: [],



}));

