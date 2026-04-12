export interface Category {
  name: string;
  slug: string;
  icon: string; // lucide icon name
  description: string;
}

export const categories: Category[] = [
  { name: "Décor", slug: "decor", icon: "Palette", description: "Beautiful event décor and styling" },
  { name: "Photographer", slug: "photographer", icon: "Camera", description: "Professional photography services" },
  { name: "Videographer", slug: "videographer", icon: "Video", description: "Cinematic videography" },
  { name: "Makeup Artist", slug: "makeup-artist", icon: "Sparkles", description: "Bridal and event makeup" },
  { name: "Catering", slug: "catering", icon: "UtensilsCrossed", description: "Authentic Tamil cuisine and catering" },
  { name: "DJ", slug: "dj", icon: "Music", description: "DJs and music entertainment" },
  { name: "Performers", slug: "performers", icon: "Mic2", description: "Live performers and artists" },
  { name: "Photo Booth", slug: "photo-booth", icon: "ImagePlus", description: "Fun photo booth experiences" },
  { name: "Venue", slug: "venue", icon: "Building2", description: "Event venues and halls" },
  { name: "Event Planner", slug: "event-planner", icon: "ClipboardList", description: "Full-service event planning" },
];

export const eventTypes = ["Wedding", "Birthday", "Corporate", "Cultural", "Engagement", "Baby Shower"];

export interface LocationOption {
  city: string;
  country: string;
}

export const locationsByCountry: Record<string, string[]> = {
  "United Kingdom": ["London", "Birmingham", "Leicester"],
  "Canada": ["Toronto", "Scarborough"],
  "France": ["Paris"],
  "Germany": ["Berlin"],
  "Australia": ["Sydney", "Melbourne"],
  "Sri Lanka": ["Colombo"],
  "India": ["Chennai", "Madurai"],
  "United States": ["New York"],
  "UAE": ["Dubai"],
  "Singapore": ["Singapore"],
  "Malaysia": ["Kuala Lumpur"],
};

export const allLocations: LocationOption[] = Object.entries(locationsByCountry).flatMap(
  ([country, cities]) => cities.map((city) => ({ city, country }))
);
