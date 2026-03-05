// SpotCard.jsx
// Child component of SpotList
// Displays a single tourist spot's details
import React from "react";
import { useNavigate } from "react-router-dom";

function SpotCard({ spot }) {
  const navigate = useNavigate();

  // navigate to the detail page when a card is clicked
  const handleClick = () => {
    navigate(`/spot/${spot.id}`);
  };

  return (
    <div className="spot-card" onClick={handleClick}>
      <h2>{spot.get("name")}</h2>
      <p className="category">{spot.get("category")}</p>
      <p className="city">{spot.get("city")}</p>
      <p>{spot.get("description")}</p>
      <p className="rating">Rating: {spot.get("rating")} / 5</p>
      <p className="hours">{spot.get("openHours")}</p>
    </div>
  );
}

export default SpotCard;