// Tamil Nadu district centroid coordinates
// Source: approximate geographic centers of each district
// Used for GIS map visualization since the dataset does not include lat/lng coordinates
// Extracted from the "IDA" field (e.g., "KANNIYAKUMARI(DISTRICT COLLECTOR...)")

export interface DistrictCoord {
  district: string;
  lat: number;
  lng: number;
}

export const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'ARIYALUR': { lat: 11.1397, lng: 79.0786 },
  'CHENGALPATTU': { lat: 12.6921, lng: 79.9767 },
  'CHENNAI': { lat: 13.0827, lng: 80.2707 },
  'COIMBATORE': { lat: 11.0168, lng: 76.9558 },
  'CUDDALORE': { lat: 11.7447, lng: 79.7688 },
  'DHARMAPURI': { lat: 12.1211, lng: 78.1582 },
  'DINDIGUL': { lat: 10.3673, lng: 77.9803 },
  'ERODE': { lat: 11.3410, lng: 77.7172 },
  'KALLAKURICHI': { lat: 11.7358, lng: 78.9607 },
  'KANCHEEPURAM': { lat: 12.8308, lng: 79.7036 },
  'KANNIYAKUMARI': { lat: 8.0883, lng: 77.5385 },
  'KARUR': { lat: 10.9601, lng: 78.0766 },
  'KRISHNAGIRI': { lat: 12.5186, lng: 78.2137 },
  'MADURAI': { lat: 9.9252, lng: 78.1198 },
  'MAYILADUTHURAI': { lat: 11.1015, lng: 79.6517 },
  'NAGAPATTINAM': { lat: 10.7654, lng: 79.8420 },
  'NAMAKKAL': { lat: 11.2191, lng: 78.1674 },
  'NILGIRIS': { lat: 11.4916, lng: 76.7337 },
  'PERAMBALUR': { lat: 11.2349, lng: 78.8818 },
  'PUDUKKOTTAI': { lat: 10.3833, lng: 78.8001 },
  'RAMANATHAPURAM': { lat: 9.3639, lng: 78.8395 },
  'RANIPET': { lat: 12.9228, lng: 79.3327 },
  'SALEM': { lat: 11.6643, lng: 78.1460 },
  'SIVAGANGA': { lat: 9.8477, lng: 78.4801 },
  'TENKASI': { lat: 8.9596, lng: 77.3156 },
  'THANJAVUR': { lat: 10.7870, lng: 79.1378 },
  'THENI': { lat: 10.0104, lng: 77.4770 },
  'THIRUVALLUR': { lat: 13.1231, lng: 79.9097 },
  'TIRUVANNAMALAI': { lat: 12.2310, lng: 79.0671 },
  'TIRUNELVELI': { lat: 8.7139, lng: 77.7567 },
  'TIRUPPUR': { lat: 11.1085, lng: 77.3411 },
  'TIRUCHIRAPPALLI': { lat: 10.7905, lng: 78.7047 },
  'TIRUVARUR': { lat: 10.7728, lng: 79.6368 },
  'THOOTHUKKUDI': { lat: 8.7642, lng: 78.1348 },
  'VELLORE': { lat: 12.9165, lng: 79.1325 },
  'VILUPPURAM': { lat: 11.9401, lng: 79.4861 },
  'VIRUDHUNAGAR': { lat: 9.5851, lng: 77.9624 },
  'ARANI': { lat: 12.6703, lng: 79.2808 },
};

// Extract district name from IDA string like "KANNIYAKUMARI(DISTRICT COLLECTOR KANNIYAKUMARI_IDA)"
export function extractDistrict(ida: string): string {
  if (!ida) return 'Unknown';
  // Try to extract from parentheses: "CITY(DISTRICT COLLECTOR DISTRICTNAME_IDA)"
  const parenMatch = ida.match(/\((?:DISTRICT COLLECTOR|COMMISSIONER|District Collector)\s+([^_)]+)/i);
  if (parenMatch) {
    return parenMatch[1].trim().toUpperCase();
  }
  // Try before parenthesis
  const beforeParen = ida.split('(')[0].trim().toUpperCase();
  if (beforeParen) return beforeParen;
  return ida.toUpperCase();
}

export function getDistrictCoords(district: string): { lat: number; lng: number } | null {
  const normalized = district.toUpperCase().trim();
  // Direct lookup
  if (DISTRICT_COORDINATES[normalized]) return DISTRICT_COORDINATES[normalized];
  // Partial match
  const key = Object.keys(DISTRICT_COORDINATES).find(
    k => normalized.includes(k) || k.includes(normalized)
  );
  return key ? DISTRICT_COORDINATES[key] : null;
}
