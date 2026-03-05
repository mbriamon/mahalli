// SearchBar.jsx
// Child component of Home
// Provides user inputs to search and filter tourist spots
import React from "react";

function SearchBar({ searchText, category, city, onSearchChange, onCategoryChange, onCityChange }) {
  return (
    <div className="search-bar">

      {/* text input to search spots by name */}
      <input
        type="text"
        placeholder="Search by name..."
        value={searchText}
        onChange={onSearchChange}
      />

      {/* dropdown to filter by category */}
      <select value={category} onChange={onCategoryChange}>
        <option value="">All Categories</option>
        <option value="Historical Site">Historical Site</option>
        <option value="Nature">Nature</option>
        <option value="Cultural">Cultural</option>
        <option value="Museum">Museum</option>
      </select>

      {/* dropdown to filter by city */}
      {/* future work: dynamically generate city options from database */}
      <select value={city} onChange={onCityChange}>
        <option value="">All Cities</option>
        <option value="Amman">Amman</option>
        <option value="Aqaba">Aqaba</option>
        <option value="Jerash">Jerash</option>
        <option value="Ajloun">Ajloun</option>
        <option value="Ma'an">Ma'an</option>
        <option value="Balqa">Balqa</option>
      </select>

    </div>
  );
}

export default SearchBar;