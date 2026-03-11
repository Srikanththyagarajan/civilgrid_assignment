import React from "react";

interface SidebarProps {
  chargers: any[];
}

const Sidebar: React.FC<SidebarProps> = ({ chargers }) => {
  return (
    <div className="sidebar">
      <h2>Nearby EV Chargers</h2>
      <div>{chargers.length} charger(s) found</div>
      {chargers.map((c, i) => {
        const [lng, lat] = c.geometry.coordinates;
        return (
          <div key={i} style={{
            padding: "10px",
            marginBottom: "8px",
            border: "1px solid #eee",
            borderRadius: "6px",
            background: "#fafafa"
          }}>
            <div><b>{c.properties.program_name || c.properties.name || `Charger ${i+1}`}</b></div>
            <div style={{ fontSize: "12px" }}>📍 {lat.toFixed(5)}, {lng.toFixed(5)}</div>
          </div>
        );
      })}
    </div>
  );
};

export default Sidebar;