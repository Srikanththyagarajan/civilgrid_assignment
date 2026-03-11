import * as turf from "@turf/turf";

export function findNearbyChargers(
  cipFeature: any,
  chargersGeoJSON: any,
  radiusKm: number = 0.5
) {
  // create 500m buffer around CIP geometry (works for Point/LineString/Polygon)
  const buffer = turf.buffer(cipFeature, radiusKm, { units: "kilometers" })!;

  const nearby: any[] = [];

  chargersGeoJSON.features.forEach((charger: any) => {
    const inside = turf.booleanPointInPolygon(charger, buffer);
    if (inside) nearby.push(charger);
  });

  return { nearby, circle: buffer };
}