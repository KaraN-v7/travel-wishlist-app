export interface DetailedPlaceInfo {
  whyFamous: string;
  thingsToDo: string[];
  nearbyAttractions: string[];
  bestTimeToVisit: string;
  estimatedBudget: string;
  flightsInfo: string;
}

export interface Place {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  visited: boolean;
  detailedInfo?: DetailedPlaceInfo;
  note?: string;
  tags: string[];
  latitude?: number;
  longitude?: number;
  isFetchingDetails?: boolean;
}

export interface Country {
  name: string;
  flagUrl: string;
  places: Place[];
}

export interface GeminiGeneratedData {
  countryName: string;
  countryCode: string;
  description: string;
  placeExists: boolean;
  detailedInfo: DetailedPlaceInfo;
  tags: string[];
  latitude: number;
  longitude: number;
}
