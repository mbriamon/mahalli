// Home.jsx
// Main page component - loads all tourist spots and handles filtering
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SpotList from "../components/SpotList";
import SearchBar from "../components/SearchBar";
import { getAllTouristSpots } from "../models/TouristSpot";
import { logoutUser } from "../services/authService";

function Home() {
  const [spots, setSpots] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const navigate = useNavigate();

  // load all tourist spots from Parse on first render
  useEffect(() => {
    getAllTouristSpots().then((data) => {
      setSpots(data);
    });
  }, []);

  // handle logout — ends the Parse session and redirects to /auth
  async function handleLogout() {
    await logoutUser();
    navigate("/auth");
  }

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
      {/* header row with title and logout button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Mahalee 🇯🇴</h1>
        {/* logout button ends the session and redirects to auth page */}
        <button onClick={handleLogout}>Logout</button>
      </div>
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