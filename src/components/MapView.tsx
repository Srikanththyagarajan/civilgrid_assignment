// src/components/MapView.tsx
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import cipProjects from "../data/cip_projects.json";
import evChargers from "../data/ev_chargers.json";
import { findNearbyChargers } from "../services/geoService";
import Sidebar from "./Sidebar";

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
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256
          }
        },
        layers: [
          { id: "osm", type: "raster", source: "osm" }
        ]
      },
      center: [-118.2437, 34.0522],
      zoom: 11
    });

    mapRef.current = map;
    const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });

    // Tooltip function: pick property that exists
    const getCIPTooltip = (props: any) =>
      props.project_title || props.project_id || "CIP Project";

    const getChargerTooltip = (props: any) =>
      props.name || props.charger_id || "EV Charger";

    map.on("load", () => {

      // -------------------
      // CIP projects
      // -------------------
      map.addSource("cip-projects", { type: "geojson", data: cipProjects as any });
      map.addLayer({
        id: "cip-layer",
        type: "circle",
        source: "cip-projects",
        paint: { "circle-radius": 6, "circle-color": "#007cbf" }
      });

      // -------------------
      // EV chargers with clustering
      // -------------------
      map.addSource("ev-chargers", {
        type: "geojson",
        data: evChargers as any,
        cluster: true,
        clusterRadius: 50,
        clusterMaxZoom: 14
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "ev-chargers",
        filter: ["has", "point_count"],
        paint: {
          // scale radius by cluster size
          "circle-radius": ["step", ["get", "point_count"], 15, 10, 20, 50, 25],
          "circle-color": "#ff9900"
        }
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "ev-chargers",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-size": 12,
          "text-anchor": "center"
        },
        paint: { "text-color": "#fff" }
      });

      map.addLayer({
        id: "charger-layer",
        type: "circle",
        source: "ev-chargers",
        filter: ["!", ["has", "point_count"]],
        paint: { "circle-radius": 5, "circle-color": "#00cc66" }
      });

      // -------------------
      // Nearby chargers + radius circle
      // -------------------
      map.addSource("nearby-chargers", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({
        id: "nearby-layer",
        type: "circle",
        source: "nearby-chargers",
        paint: { "circle-radius": 8, "circle-color": "#ff0000" }
      });

      map.addSource("radius-circle", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({
        id: "radius-layer",
        type: "fill",
        source: "radius-circle",
        paint: { "fill-color": "#007cbf", "fill-opacity": 0.2 }
      });

      // -------------------
      // Click CIP project → show nearby chargers + radius
      // -------------------
      map.on("click", "cip-layer", (e) => {
        const feature = e.features?.[0];
        if (!feature) return;

        const { nearby, circle } = findNearbyChargers(feature, evChargers);
        setNearbyList(nearby);

        const nearbySource = map.getSource("nearby-chargers") as maplibregl.GeoJSONSource;
        nearbySource.setData({ type: "FeatureCollection", features: nearby } as any);

        const circleSource = map.getSource("radius-circle") as maplibregl.GeoJSONSource;
        circleSource.setData(circle as any);
      });

      // -------------------
      // Tooltips
      // -------------------
      const layersWithProps = ["cip-layer", "charger-layer", "nearby-layer"];
      layersWithProps.forEach(layer => {
        map.on("mouseenter", layer, (e) => {
          const feature = e.features?.[0];
          if (!feature) return;
          map.getCanvas().style.cursor = "pointer";

          const html =
            layer === "cip-layer"
              ? `<b>${getCIPTooltip(feature.properties)}</b>`
              : `<b>${getChargerTooltip(feature.properties)}</b>`;

          popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
        });
        map.on("mouseleave", layer, () => { map.getCanvas().style.cursor = ""; popup.remove(); });
      });

      // Cluster tooltip
      map.on("mouseenter", "clusters", (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const count = feature.properties.point_count;
        popup.setLngLat(e.lngLat).setHTML(`<b>${count} chargers</b>`).addTo(map);
      });
      map.on("mouseleave", "clusters", () => popup.remove());

    });

  }, []);

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <Sidebar chargers={nearbyList} />
      <div ref={mapContainer} style={{ flex: 1, height: "100vh" }} />
    </div>
  );
}