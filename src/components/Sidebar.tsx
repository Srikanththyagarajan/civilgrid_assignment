import React from "react";
import type { ChargerFeature } from "./../types/geo";

interface SidebarProps {
  chargers: ChargerFeature[];
}

const Sidebar: React.FC<SidebarProps> = ({ chargers }) => {
  return (
    <div className="sidebar">
      <h2>Nearby EV Chargers</h2>
      <div>{chargers.length} charger(s) found</div>
      {chargers.map((c, i) => {
        const [lng, lat] = c.geometry.coordinates;
        return (
          <section key={i}>
            <div><b>{c.properties.name || c.properties.charger_id || `Charger ${i+1}`}</b></div>
            <div style={{ fontSize: "12px" }}> {lat.toFixed(5)}, {lng.toFixed(5)}</div>
          </section>
        );
      })}
    </div>
  );
};

export default Sidebar;