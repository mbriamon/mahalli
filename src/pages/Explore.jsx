// Explore.jsx
// Explore page — shows all spots in a searchable grid
// Map feature will be added in the next feature

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SpotList from "../components/SpotList";
import SearchBar from "../components/SearchBar";
import { getAllTouristSpots } from "../models/TouristSpot";

export default function Explore() {
  const [spots, setSpots]         = useState([]);
  const [searchText, setSearch]   = useState("");
  const [category, setCategory]   = useState("");
  const [city, setCity]           = useState("");
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    getAllTouristSpots()
      .then((data) => setSpots(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = spots.filter((spot) =>
    spot.get("Name").toLowerCase().includes(searchText.toLowerCase()) &&
    (category === "" || spot.get("Category") === category) &&
    (city === ""     || spot.get("City")     === city)
  );

  return (
    <div>
      <Navbar />

      <div className="hero-band" style={{ background: "var(--jade)" }}>
        <h2>"Every corner of Jordan, mapped."</h2>
        <p>Browse all {spots.length} spots — search, filter, and find your next adventure.</p>
      </div>

      <SearchBar
        searchText={searchText}
        category={category}
        city={city}
        onSearchChange={(e) => setSearch(e.target.value)}
        onCategoryChange={(e) => setCategory(e.target.value)}
        onCityChange={(e) => setCity(e.target.value)}
      />

      <div className="spot-count">
        {loading ? "Loading…" : `${filtered.length} spots found`}
      </div>

      <SpotList spots={filtered} />
    </div>
  );
}