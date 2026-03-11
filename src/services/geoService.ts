import * as turf from "@turf/turf";
import type { CIPFeature, ChargerFeature } from "../types/geo";

export function findNearbyChargers(
  cipFeature: CIPFeature,
  chargers: { features: ChargerFeature[] },
  radiusKm: number = 0.5
) {
  const buffer = turf.buffer(cipFeature, radiusKm, { units: "kilometers" });
  if (!buffer) return { nearby: [], circle: null };
  const nearby = chargers.features.filter(charger => turf.booleanPointInPolygon(charger, buffer));
  return { nearby, circle: buffer };
}