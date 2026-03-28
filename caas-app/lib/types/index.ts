type DobType = "ad" | "bs";
type Gender = "male" | "female" | "other";
export interface User {
  idx: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  gender: Gender;
  dob_type: DobType;
  image: string | null;
  primary_role: string;
  perms: string[];
  roles: string[];
}

export type CurrentUserSettings = {
  idx: string;
  language: 1 | 2;
  theme: 1 | 2;
  is_new_event_alerts_enabled: boolean;
  is_event_remainder_enabled: boolean;
  email_marketing: boolean;
  push_events: boolean;
  push_reminders: boolean;
};

export interface PaginatedAPIResponse<TData> {
  count: number;
  previous?: string;
  next?: string;
  results: TData[];
}

export interface Category {
  idx: string;
  name: string;
  image: string;
  description: string;
}

export interface EventLocation {
  idx: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface EventCategory {
  idx: string;
  name: string;
}

export interface EventOrganizer {
  idx: string;
  name: string;
  image: string | null;
}

export interface Event {
  idx: string;
  title: string;
  description: string;
  start_datetime: string;
  end_datetime: string;
  location: EventLocation;
  is_paid: boolean;
  price: number;
  category: EventCategory;
  organizer: EventOrganizer;
  max_attendees: number;
  total_attendees: number;
  joined_attendees: number;
  cover_image: string | null;
  duration: string;
  tags: string[];
  is_online: boolean;
  online_url: string | null;
  payment_qr: string | null;
  status: number;
}

export interface EventSummary {
  total_clicks: number;
  total_attendees: number;
  joined_attendees: number;
  pending_attendees: number;
  total_favorites: number;
  max_attendees: number;
  potential_revenue: number;
  confirmed_revenue: number;
  spots_left: number;
}

export interface Attendee {
  idx: string;
  name: string;
  image: string | null;
}

export interface GalleryImage {
  idx: string;
  image: string;
  caption?: string;
}

export interface FilterState {
  search: string;
  category: string;
  is_paid: boolean | null;
  start_date: string;
  end_date: string;
}

export interface BlogPost {
  idx: string;
  title: string;
  content: string;
  created_at: string;
  tags: string[];
  is_published: boolean;
  image: string | null;
  author: User;
}

export interface EventJoinRequest {
  idx: string;
  user: User;
  event: Event;
  payment_status: number;
  payment_proof?: string;
  created_at: string;
}
