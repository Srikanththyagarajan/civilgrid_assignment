import type { Feature, Point, FeatureCollection } from "geojson";

export type CIPProperties = {
  project_title?: string;
  project_id?: string;
};

export type ChargerProperties = {
  name?: string;
  charger_id?: string;
};

export type CIPFeature = Feature<Point, CIPProperties>;
export type ChargerFeature = Feature<Point, ChargerProperties>;
export type CIPFeatureCollection = FeatureCollection<Point, CIPProperties>;
export type ChargerFeatureCollection = FeatureCollection<Point, ChargerProperties>;