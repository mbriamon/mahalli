// Explore.jsx
// Explore page — searchable spot grid plus interactive Leaflet map
// Map pins are driven by Latitude/Longitude fields from Back4App

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SpotList from "../components/SpotList";
import SearchBar from "../components/SearchBar";
import { getAllTouristSpots } from "../models/TouristSpot";

// Leaflet imports
import L from "leaflet";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// fix Leaflet default icon paths broken by Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// category colours for map pins
const CAT_COLORS = {
  food:     "#C2623F",
  cafe:     "#C49A3C",
  historic: "#7C3AED",
  nature:   "#2D6A5A",
  culture:  "#2563EB",
  default:  "#4A4540",
};

function getColor(cat) {
  return CAT_COLORS[(cat || "").toLowerCase()] || CAT_COLORS.default;
}

// custom circle marker icon
function makeIcon(cat) {
  const color = getColor(cat);
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50%;
      background: ${color}; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700;
      border: 2.5px solid #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,.25);
      cursor: pointer;
    ">${
      cat === "food"     ? "🍽" :
      cat === "cafe"     ? "☕" :
      cat === "historic" ? "🏛" :
      cat === "nature"   ? "🌿" :
      cat === "culture"  ? "🎨" : "📍"
    }</div>`,
    iconSize:    [28, 28],
    iconAnchor:  [14, 14],
    popupAnchor: [0, -16],
  });
}

// convert spots array to GeoJSON FeatureCollection
function spotsToGeoJSON(spots) {
  return {
    type: "FeatureCollection",
    features: spots
      .filter((s) => s.get("Latitude") && s.get("Longitude"))
      .map((s) => ({
        type: "Feature",
        geometry: {
          type:        "Point",
          coordinates: [s.get("Longitude"), s.get("Latitude")],
        },
        properties: {
          id:          s.id,
          name:        s.get("Name"),
          category:    s.get("Category"),
          city:        s.get("City"),
          description: s.get("Description"),
          rating:      s.get("Initial_Rating"),
          priceRange:  s.get("Price_Range"),
          insiderTip:  s.get("Insider_Tip"),
        },
      })),
  };
}

// fly to bounds when filtered spots change
function FitBounds({ geojson }) {
  const map = useMap();
  useEffect(() => {
    if (!geojson.features.length) return;
    const layer = L.geoJSON(geojson);
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [geojson]);
  return null;
}

const JORDAN_CENTER = [31.5, 36.0];
const VIEW_MODES    = ["grid", "map", "split"];

export default function Explore() {
  const navigate                    = useNavigate();
  const [spots, setSpots]           = useState([]);
  const [searchText, setSearch]     = useState("");
  const [category, setCategory]     = useState("");
  const [city, setCity]             = useState("");
  const [loading, setLoading]       = useState(true);
  const [viewMode, setViewMode]     = useState("split");
  const [selectedSpot, setSelected] = useState(null);
  const geojsonRef                  = useRef(null);

  useEffect(() => {
    getAllTouristSpots()
      .then((data) => setSpots(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = spots.filter((spot) =>
    spot.get("Name").toLowerCase().includes(searchText.toLowerCase()) &&
    (category === "" || spot.get("Category") === category) &&
    (city     === "" || spot.get("City")     === city)
  );

  const geojson = spotsToGeoJSON(filtered);

  // style each GeoJSON point as a custom icon
  function pointToLayer(feature, latlng) {
    return L.marker(latlng, {
      icon: makeIcon(feature.properties.category),
    });
  }

  // bind popup to each marker
  function onEachFeature(feature, layer) {
    const p = feature.properties;
    layer.bindPopup(`
      <div style="font-family:'DM Sans',sans-serif;min-width:180px;padding:4px">
        <div style="font-weight:600;font-size:13px;margin-bottom:4px">${p.name}</div>
        <div style="font-size:11px;color:#7A746E;margin-bottom:8px">
          ${p.category} · ${p.city}
          ${p.rating ? ` · ★ ${p.rating}` : ""}
        </div>
        ${p.insiderTip
          ? `<div style="font-size:11px;color:#1A4036;background:#E2F0EB;padding:6px 8px;border-radius:6px;margin-bottom:8px;line-height:1.4">
              💡 ${p.insiderTip}
             </div>`
          : ""}
        <button
          onclick="window.location.href='/spot/${p.id}'"
          style="
            width:100%;padding:7px;background:#C2623F;color:#fff;
            border:none;border-radius:6px;font-size:12px;
            font-weight:500;cursor:pointer;
          "
        >
          View details →
        </button>
      </div>
    `, { maxWidth: 220 });

    layer.on("click", () => setSelected(p));
  }

  return (
    <div>
      <Navbar />

      {/* hero */}
      <div className="hero-band" style={{ background: "var(--jade)" }}>
        <h2>"Every corner of Jordan, mapped."</h2>
        <p>
          {loading
            ? "Loading spots…"
            : `${spots.length} spots across Jordan — search, filter, explore.`}
        </p>
      </div>

      {/* search + view toggle */}
      <div className="explore-toolbar">
        <SearchBar
          searchText={searchText}
          category={category}
          city={city}
          onSearchChange={(e) => setSearch(e.target.value)}
          onCategoryChange={(e) => setCategory(e.target.value)}
          onCityChange={(e) => setCity(e.target.value)}
        />
        <div className="view-toggle">
          <button
            className={`view-btn${viewMode === "grid"  ? " active" : ""}`}
            onClick={() => setViewMode("grid")}
            title="Grid view"
          >
            ⊞ Grid
          </button>
          <button
            className={`view-btn${viewMode === "split" ? " active" : ""}`}
            onClick={() => setViewMode("split")}
            title="Split view"
          >
            ⊟ Split
          </button>
          <button
            className={`view-btn${viewMode === "map"   ? " active" : ""}`}
            onClick={() => setViewMode("map")}
            title="Map view"
          >
            🗺 Map
          </button>
        </div>
      </div>

      <div className="spot-count" style={{ paddingBottom: 8 }}>
        {loading ? "Loading…" : `${filtered.length} spots found`}
      </div>

      {/* map legend */}
      {(viewMode === "map" || viewMode === "split") && (
        <div className="map-legend">
          {Object.entries(CAT_COLORS).filter(([k]) => k !== "default").map(([cat, color]) => (
            <div key={cat} className="legend-item">
              <div className="legend-dot" style={{ background: color }} />
              <span>{cat}</span>
            </div>
          ))}
        </div>
      )}

      {/* content area */}
      {viewMode === "grid" && (
        <SpotList spots={filtered} />
      )}

      {viewMode === "map" && (
        <div className="map-fullscreen">
          <MapContainer
            center={JORDAN_CENTER}
            zoom={7}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"

            />
            <GeoJSON
              key={JSON.stringify(geojson)}
              data={geojson}
              pointToLayer={pointToLayer}
              onEachFeature={onEachFeature}
              ref={geojsonRef}
            />
            <FitBounds geojson={geojson} />
          </MapContainer>
        </div>
      )}

      {viewMode === "split" && (
        <div className="split-view">
          {/* left: map */}
          <div className="split-map">
            <MapContainer
              center={JORDAN_CENTER}
              zoom={7}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"

              />
              <GeoJSON
                key={JSON.stringify(geojson)}
                data={geojson}
                pointToLayer={pointToLayer}
                onEachFeature={onEachFeature}
                ref={geojsonRef}
              />
              <FitBounds geojson={geojson} />
            </MapContainer>
          </div>

          {/* right: spot list */}
          <div className="split-list">
            {/* selected spot detail panel */}
            {selectedSpot && (
              <div className="split-selected fade-in">
                <div className="split-selected-header">
                  <div>
                    <div className="split-selected-name">{selectedSpot.name}</div>
                    <div className="split-selected-meta">
                      {selectedSpot.category} · {selectedSpot.city}
                      {selectedSpot.rating ? ` · ★ ${selectedSpot.rating}` : ""}
                    </div>
                  </div>
                  <button
                    className="modal-close"
                    onClick={() => setSelected(null)}
                  >×</button>
                </div>
                {selectedSpot.description && (
                  <p className="split-selected-desc">{selectedSpot.description}</p>
                )}
                {selectedSpot.insiderTip && (
                  <div className="insider-tip" style={{ margin: "10px 0" }}>
                    <strong>Insider tip</strong>
                    {selectedSpot.insiderTip}
                  </div>
                )}
                <button
                  className="mark-visited-btn"
                  style={{ width: "100%", padding: "9px", marginTop: 4 }}
                  onClick={() => navigate(`/spot/${selectedSpot.id}`)}
                >
                  View full details →
                </button>
              </div>
            )}

            {/* scrollable spot rows */}
            <div className="split-spot-rows">
              {filtered.map((spot) => (
                <div
                  key={spot.id}
                  className={`split-spot-row${selectedSpot?.id === spot.id ? " selected" : ""}`}
                  onClick={() => {
                    setSelected({
                      id:          spot.id,
                      name:        spot.get("Name"),
                      category:    spot.get("Category"),
                      city:        spot.get("City"),
                      description: spot.get("Description"),
                      rating:      spot.get("Initial_Rating"),
                      priceRange:  spot.get("Price_Range"),
                      insiderTip:  spot.get("Insider_Tip"),
                    });
                  }}
                >
                  <div className="split-spot-emoji">
                    {spot.get("Category") === "food"     ? "🍽" :
                     spot.get("Category") === "cafe"     ? "☕" :
                     spot.get("Category") === "historic" ? "🏛" :
                     spot.get("Category") === "nature"   ? "🌿" :
                     spot.get("Category") === "culture"  ? "🎨" : "📍"}
                  </div>
                  <div className="split-spot-info">
                    <div className="split-spot-name">{spot.get("Name")}</div>
                    <div className="split-spot-meta">
                      {spot.get("City")}
                      {spot.get("Initial_Rating")
                        ? ` · ★ ${spot.get("Initial_Rating")}`
                        : ""}
                    </div>
                  </div>
                  <div className="split-spot-price">
                    {spot.get("Price_Range")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}