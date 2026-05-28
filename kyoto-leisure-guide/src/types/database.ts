export interface Category {
  id: string;
  name: string;
  icon: string | null;
}

export interface Place {
  id: string;
  name: string;
  name_ja: string | null;
  category_id: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  price_range: number | null;
  opening_hours: string | null;
  image_url: string | null;
  tags: string[];
  created_at: string;
  category?: Category;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  season: "spring" | "summer" | "autumn" | "winter";
  place_id: string | null;
  image_url: string | null;
  created_at: string;
  place?: Place;
}

export interface BusRoute {
  id: string;
  route_number: string;
  route_name: string;
  color: string | null;
}

export interface BusStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  route_ids: string[];
}

export interface Bookmark {
  id: string;
  user_id: string;
  target_type: "place" | "event";
  target_id: string;
  created_at: string;
}

export const SEASON_LABELS: Record<string, string> = {
  spring: "봄 🌸",
  summer: "여름 🌻",
  autumn: "가을 🍁",
  winter: "겨울 ❄️",
};

export const PRICE_LABELS: Record<number, string> = {
  1: "무료",
  2: "보통",
  3: "비쌈",
};
