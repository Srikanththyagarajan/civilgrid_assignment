# LA CIP & EV Charger Synergy Map

This project is a **React + TypeScript** web application using **MapLibre GL JS** and **Turf.js** to help the City of Los Angeles visualize opportunities for capital improvements in synergy with EV charger expansion.

---

## Features

- **CIP Projects** displayed as blue circles
- **EV Chargers** with clustering (orange circles scale with number of chargers)
- **Click on a CIP project**:
  - Draws a **500 m radius circle** around the project
  - Highlights **nearby EV chargers**
  - Updates the **sidebar** with a list of nearby chargers
- **Tooltips**:
  - Show only **project/program name** or **charger name/id**
  - Cluster tooltips show **number of chargers**
- **Sidebar**:
  - Displays a scrollable list of **nearby EV chargers** with name and coordinates

---

## Tech Stack

- **React** + **TypeScript**  
- **MapLibre GL JS** for mapping  
- **Turf.js** for geospatial calculations  
- **OpenStreetMap** as the base map  

---

## Installation

1. Clone the repo:

```bash
git clone <repo-url>
cd ev-map
