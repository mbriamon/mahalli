// Home.jsx
// Main page component - loads all tourist spots and handles filtering
import React, { useState, useEffect } from "react";
import SpotList from "../components/SpotList";
import SearchBar from "../components/SearchBar";
import { getAllTouristSpots } from "../models/TouristSpot";

function Home() {
  const [spots, setSpots] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");

  // load all tourist spots from Parse on first render
  useEffect(() => {
    getAllTouristSpots().then((data) => {
      setSpots(data);
    });
  }, []);

  // filter spots based on search text, category, and city
  const filteredSpots = spots.filter((spot) => {
    return (
      spot.get("name").toLowerCase().includes(searchText.toLowerCase()) &&
      (category === "" || spot.get("category") === category) &&
      (city === "" || spot.get("city") === city)
    );
  });

  return (
    <div>
      <h1>Mahalee 🇯🇴</h1>
      {/* pass filter state and handlers down to SearchBar */}
      <SearchBar
        searchText={searchText}
        category={category}
        city={city}
        onSearchChange={(e) => setSearchText(e.target.value)}
        onCategoryChange={(e) => setCategory(e.target.value)}
        onCityChange={(e) => setCity(e.target.value)}
      />
      {/* pass filtered spots down to SpotList */}
      <SpotList spots={filteredSpots} />
    </div>
  );
}

export default Home;