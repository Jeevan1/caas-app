type DobType = "ad" | "bs";
type Gender = "male" | "female" | "other";
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  gender: Gender;
  dob_type: DobType;
  image: string | null;
  primary_role: string;
  perms: string[];
}

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
  cover_image: string | null;
  duration: string;
  tags: string[];
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
