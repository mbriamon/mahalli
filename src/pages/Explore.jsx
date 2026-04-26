// Explore.jsx
// Explore page — searchable spot grid plus interactive Leaflet map
// Includes sort, near me, and hashtag/review search

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getAllTouristSpots } from "../models/TouristSpot";
import { getReviewsForSpot } from "../services/reviewService";
import { isWishlisted, addToWishlist, removeFromWishlist } from "../services/wishlistService";

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

function makeIcon(cat) {
  const color = getColor(cat);
  return L.divIcon({
    className: "",
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:${color};color:#fff;
      display:flex;align-items:center;justify-content:center;
      font-size:13px;font-weight:700;
      border:2.5px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,.25);
      cursor:pointer;
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

function FitBounds({ geojson }) {
  const map = useMap();
  useEffect(() => {
    if (!geojson.features.length) return;
    const layer  = L.geoJSON(geojson);
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [geojson]);
  return null;
}

// Layann's home location — hardcoded for near me demo
const LAYANN_HOME  = { lat: 31.9539, lng: 35.9106, label: "Amman, Jordan" };
const JORDAN_CENTER = [31.5, 36.0];

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R    = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a    =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Explore() {
  const navigate                      = useNavigate();
  const [spots, setSpots]             = useState([]);
  const [allReviews, setAllReviews]   = useState({});
  const [searchText, setSearch]       = useState("");
  const [category, setCategory]       = useState("");
  const [city, setCity]               = useState("");
  const [sortBy, setSortBy]           = useState("default");
  const [nearMe, setNearMe]           = useState(false);
  const [loading, setLoading]         = useState(true);
  const [viewMode, setViewMode]       = useState("split");
  const [selectedSpot, setSelected]   = useState(null);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const geojsonRef                    = useRef(null);

  useEffect(() => {
    getAllTouristSpots().then(async (data) => {
      setSpots(data);

      // load wishlist state for all spots
      const wSet = new Set();
      await Promise.all(
        data.slice(0, 30).map(async (s) => {
          const w = await isWishlisted(s.id);
          if (w) wSet.add(s.id);
        })
      );
      setWishlistIds(wSet);
      setLoading(false);
    });
  }, []);

  // toggle wishlist
  async function toggleWishlist(e, spotId) {
    e.stopPropagation();
    if (wishlistIds.has(spotId)) {
      await removeFromWishlist(spotId);
      setWishlistIds((prev) => { const n = new Set(prev); n.delete(spotId); return n; });
    } else {
      await addToWishlist(spotId);
      setWishlistIds((prev) => new Set([...prev, spotId]));
    }
  }

  // hashtag/review search — searches name, city, category, AND review hashtags
  const isHashtagSearch = searchText.startsWith("#");

  function matchesSearch(spot) {
    if (!searchText) return true;
    const q = searchText.toLowerCase().replace(/^#/, "");

    // normal text search
    if (!isHashtagSearch) {
      return (
        spot.get("Name").toLowerCase().includes(q) ||
        (spot.get("City")     || "").toLowerCase().includes(q) ||
        (spot.get("Category") || "").toLowerCase().includes(q) ||
        (spot.get("Description") || "").toLowerCase().includes(q)
      );
    }

    // hashtag search — check cached reviews
    const reviews = allReviews[spot.id] || [];
    return reviews.some((r) =>
      r.hashtags.some((t) => t.toLowerCase().includes(q))
    );
  }

  // load reviews for hashtag search when # is typed
  useEffect(() => {
    if (!isHashtagSearch || spots.length === 0) return;
    async function loadReviews() {
      const map = {};
      await Promise.all(
        spots.map(async (s) => {
          const { getReviewsForSpot } = await import("../services/reviewService");
          map[s.id] = await getReviewsForSpot(s.id);
        })
      );
      setAllReviews(map);
    }
    loadReviews();
  }, [isHashtagSearch, spots]);

  let filtered = spots.filter((spot) =>
    matchesSearch(spot) &&
    (category === "" || spot.get("Category") === category) &&
    (city     === "" || spot.get("City")     === city)
  );

  // near me — sort by distance from Layann's home
  if (nearMe) {
    filtered = [...filtered]
      .filter((s) => s.get("Latitude") && s.get("Longitude"))
      .sort((a, b) => {
        const da = getDistanceKm(
          LAYANN_HOME.lat, LAYANN_HOME.lng,
          a.get("Latitude"), a.get("Longitude")
        );
        const db = getDistanceKm(
          LAYANN_HOME.lat, LAYANN_HOME.lng,
          b.get("Latitude"), b.get("Longitude")
        );
        return da - db;
      });
  }

  // sort
  if (!nearMe) {
    if (sortBy === "rating") {
      filtered = [...filtered].sort(
        (a, b) => (b.get("Initial_Rating") || 0) - (a.get("Initial_Rating") || 0)
      );
    } else if (sortBy === "newest") {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.get("createdAt")) - new Date(a.get("createdAt"))
      );
    }
  }

  const geojson = spotsToGeoJSON(filtered);

  function pointToLayer(feature, latlng) {
    return L.marker(latlng, { icon: makeIcon(feature.properties.category) });
  }

  function onEachFeature(feature, layer) {
    const p = feature.properties;
    layer.bindPopup(`
      <div style="font-family:'DM Sans',sans-serif;min-width:180px;padding:4px">
        <div style="font-weight:600;font-size:13px;margin-bottom:4px">${p.name}</div>
        <div style="font-size:11px;color:#7A746E;margin-bottom:8px">
          ${p.category} · ${p.city}${p.rating ? ` · ★ ${p.rating}` : ""}
        </div>
        ${p.insiderTip
          ? `<div style="font-size:11px;color:#1A4036;background:#E2F0EB;padding:6px 8px;border-radius:6px;margin-bottom:8px;line-height:1.4">
              💡 ${p.insiderTip}
             </div>`
          : ""}
        <button
          onclick="window.location.href='/spot/${p.id}'"
          style="width:100%;padding:7px;background:#C2623F;color:#fff;
            border:none;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;"
        >View details →</button>
      </div>
    `, { maxWidth: 220 });
    layer.on("click", () => setSelected(p));
  }

  function getCategoryClass(cat) {
    if (!cat) return "category category-default";
    switch (cat.toLowerCase()) {
      case "food":     return "category category-food";
      case "cafe":     return "category category-cafe";
      case "historic": return "category category-historic";
      case "nature":   return "category category-nature";
      case "culture":  return "category category-culture";
      default:         return "category category-default";
    }
  }

  function getEmoji(cat) {
    switch ((cat || "").toLowerCase()) {
      case "food":     return "🍽";
      case "cafe":     return "☕";
      case "historic": return "🏛";
      case "nature":   return "🌿";
      case "culture":  return "🎨";
      default:         return "📍";
    }
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

      {/* toolbar */}
      <div className="explore-toolbar">
        <div className="explore-search-row">
          {/* search */}
          <input
            className="explore-search"
            placeholder="Search spots, cities, or #hashtags…"
            value={searchText}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* category filter */}
          <select
            className="explore-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            <option value="food">Food</option>
            <option value="cafe">Cafe</option>
            <option value="historic">Historic</option>
            <option value="nature">Nature</option>
            <option value="culture">Culture</option>
          </select>

          {/* city filter */}
          <select
            className="explore-select"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="">All cities</option>
            {[...new Set(spots.map((s) => s.get("City")).filter(Boolean))].sort().map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* sort */}
          <select
            className="explore-select"
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setNearMe(false); }}
          >
            <option value="default">Sort: Default</option>
            <option value="rating">Sort: Top rated</option>
            <option value="newest">Sort: Newest</option>
          </select>

          {/* near me */}
          <button
            className={`near-me-btn${nearMe ? " active" : ""}`}
            onClick={() => { setNearMe(!nearMe); setSortBy("default"); }}
          >
            📍 {nearMe ? `Near ${LAYANN_HOME.label}` : "Near me"}
          </button>
        </div>

        {/* view toggle */}
        <div className="view-toggle">
          <button
            className={`view-btn${viewMode === "grid"  ? " active" : ""}`}
            onClick={() => setViewMode("grid")}
          >⊞ Grid</button>
          <button
            className={`view-btn${viewMode === "split" ? " active" : ""}`}
            onClick={() => setViewMode("split")}
          >⊟ Split</button>
          <button
            className={`view-btn${viewMode === "map"   ? " active" : ""}`}
            onClick={() => setViewMode("map")}
          >🗺 Map</button>
        </div>
      </div>

      {/* status row */}
      <div className="explore-status-row">
        <div className="spot-count" style={{ padding: 0 }}>
          {loading ? "Loading…" : `${filtered.length} spots found`}
          {nearMe && (
            <span className="near-me-label"> · sorted by distance from {LAYANN_HOME.label}</span>
          )}
          {isHashtagSearch && searchText.length > 1 && (
            <span className="near-me-label"> · searching by hashtag</span>
          )}
        </div>
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

      {/* grid view */}
      {viewMode === "grid" && (
        <div className="spot-list">
          {filtered.map((spot) => (
            <div
              key={spot.id}
              className="spot-card"
              onClick={() => navigate(`/spot/${spot.id}`)}
            >
              <div className="spot-card-body">
                <div className="spot-card-top-row">
                  <h2>{spot.get("Name")}</h2>
                  <button
                    className={`wishlist-btn${wishlistIds.has(spot.id) ? " active" : ""}`}
                    onClick={(e) => toggleWishlist(e, spot.id)}
                    title={wishlistIds.has(spot.id) ? "Remove from wishlist" : "Save to wishlist"}
                  >
                    {wishlistIds.has(spot.id) ? "♥" : "♡"}
                  </button>
                </div>
                <span className={getCategoryClass(spot.get("Category"))}>
                  {spot.get("Category")}
                </span>
                <p className="city">{spot.get("City")}</p>
                <p>{spot.get("Description")}</p>
                <p className="rating">★ {spot.get("Initial_Rating")} / 5</p>
                <p className="hours">{spot.get("Hours")}</p>
                {nearMe && spot.get("Latitude") && spot.get("Longitude") && (
                  <p className="distance-label">
                    📍 {getDistanceKm(
                      LAYANN_HOME.lat, LAYANN_HOME.lng,
                      spot.get("Latitude"), spot.get("Longitude")
                    ).toFixed(1)} km away
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* map view */}
      {viewMode === "map" && (
        <div className="map-fullscreen">
          <MapContainer
            center={JORDAN_CENTER}
            zoom={7}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
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

      {/* split view */}
      {viewMode === "split" && (
        <div className="split-view">
          <div className="split-map">
            <MapContainer
              center={JORDAN_CENTER}
              zoom={7}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
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

          <div className="split-list">
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
                  <button className="modal-close" onClick={() => setSelected(null)}>×</button>
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

            <div className="split-spot-rows">
              {filtered.map((spot) => (
                <div
                  key={spot.id}
                  className={`split-spot-row${selectedSpot?.id === spot.id ? " selected" : ""}`}
                  onClick={() => setSelected({
                    id:          spot.id,
                    name:        spot.get("Name"),
                    category:    spot.get("Category"),
                    city:        spot.get("City"),
                    description: spot.get("Description"),
                    rating:      spot.get("Initial_Rating"),
                    priceRange:  spot.get("Price_Range"),
                    insiderTip:  spot.get("Insider_Tip"),
                  })}
                >
                  <div className="split-spot-emoji">{getEmoji(spot.get("Category"))}</div>
                  <div className="split-spot-info">
                    <div className="split-spot-name">{spot.get("Name")}</div>
                    <div className="split-spot-meta">
                      {spot.get("City")}
                      {spot.get("Initial_Rating") ? ` · ★ ${spot.get("Initial_Rating")}` : ""}
                      {nearMe && spot.get("Latitude") && (
                        <span style={{ color: "var(--terra)" }}>
                          {" · "}
                          {getDistanceKm(
                            LAYANN_HOME.lat, LAYANN_HOME.lng,
                            spot.get("Latitude"), spot.get("Longitude")
                          ).toFixed(1)} km
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className={`wishlist-btn${wishlistIds.has(spot.id) ? " active" : ""}`}
                    onClick={(e) => toggleWishlist(e, spot.id)}
                  >
                    {wishlistIds.has(spot.id) ? "♥" : "♡"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

