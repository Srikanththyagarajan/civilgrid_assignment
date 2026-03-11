export interface GeoFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: Record<string, any>;
}

export interface GeoFeatureCollection {
  type: "FeatureCollection";
  features: GeoFeature[];
}