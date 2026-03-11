import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import cipProjectsData from "../data/cip_projects.json";
import evChargersData from "../data/ev_chargers.json";
import type { CIPFeature } from "../types/geo";
import { findNearbyChargers } from "../services/geoService";
import Sidebar from "./Sidebar";
import {
  CIP_COLOR,
  CHARGER_COLOR,
  NEARBY_COLOR,
  CLUSTER_COLOR,
  CLUSTER_RADIUS,
  RADIUS_METERS
} from "../constants/mapConstants";

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [nearbyList, setNearbyList] = useState<any[]>([]);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256 }
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }]
      },
      center: [-118.2437, 34.0522],
      zoom: 11
    });

    mapRef.current = map;
    const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });

    const getCIPTooltip = (props: any) => props.project_title || props.project_id || "CIP Project";
    const getChargerTooltip = (props: any) => props.name || props.charger_id || "EV Charger";

    map.on("load", () => {

      // ------------------- CIP -------------------
      map.addSource("cip-projects", { type: "geojson", data: cipProjectsData as any });
      map.addLayer({ id: "cip-layer", type: "circle", source: "cip-projects", paint: { "circle-radius": 6, "circle-color": CIP_COLOR } });

      // ------------------- EV Chargers -------------------
      map.addSource("ev-chargers", { type: "geojson", data: evChargersData as any, cluster: true, clusterRadius: CLUSTER_RADIUS, clusterMaxZoom: 14 });
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "ev-chargers",
        filter: ["has", "point_count"],
        paint: { "circle-radius": ["step", ["get", "point_count"], 15, 10, 20, 50, 25], "circle-color": CLUSTER_COLOR }
      });
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "ev-chargers",
        filter: ["has", "point_count"],
        layout: { "text-field": "{point_count_abbreviated}", "text-size": 12, "text-anchor": "center" },
        paint: { "text-color": "#fff" }
      });
      map.addLayer({
        id: "charger-layer",
        type: "circle",
        source: "ev-chargers",
        filter: ["!", ["has", "point_count"]],
        paint: { "circle-radius": 5, "circle-color": CHARGER_COLOR }
      });

      // ------------------- Nearby -------------------
      map.addSource("nearby-chargers", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({ id: "nearby-layer", type: "circle", source: "nearby-chargers", paint: { "circle-radius": 8, "circle-color": NEARBY_COLOR } });

      map.addSource("radius-circle", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({ id: "radius-layer", type: "fill", source: "radius-circle", paint: { "fill-color": CIP_COLOR, "fill-opacity": 0.2 } });

      // ------------------- CIP click -------------------
      map.on("click", "cip-layer", e => {
        const feature = e.features?.[0];
        if (!feature) return;

        const { nearby, circle } = findNearbyChargers(feature as CIPFeature, evChargersData as any, RADIUS_METERS / 1000);
        setNearbyList(nearby);

        const nearbySource = map.getSource("nearby-chargers") as maplibregl.GeoJSONSource;
        nearbySource.setData({ type: "FeatureCollection", features: nearby });

        const circleSource = map.getSource("radius-circle") as maplibregl.GeoJSONSource;
        if (circle) {
          circleSource.setData(circle as any);
        }
      });

      // ------------------- Tooltips -------------------
      const layers = ["cip-layer", "charger-layer", "nearby-layer"];
      layers.forEach(layer => {
        map.on("mouseenter", layer, e => {
          const feature = e.features?.[0];
          if (!feature) return;
          map.getCanvas().style.cursor = "pointer";
          const html = layer === "cip-layer" ? `<b>${getCIPTooltip(feature.properties)}</b>` : `<b>${getChargerTooltip(feature.properties)}</b>`;
          popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
        });
        map.on("mouseleave", layer, () => { map.getCanvas().style.cursor = ""; popup.remove(); });
      });

      // ------------------- Cluster tooltip -------------------
      map.on("mouseenter", "clusters", e => {
        const feature = e.features?.[0];
        if (!feature) return;
        popup.setLngLat(e.lngLat).setHTML(`<b>${feature.properties.point_count} chargers</b>`).addTo(map);
      });
      map.on("mouseleave", "clusters", () => popup.remove());
    });

  }, []);

  return (
    <div className="container">
      <Sidebar chargers={nearbyList} />
      <div ref={mapContainer} className="mapContainer" />
    </div>
  );
}