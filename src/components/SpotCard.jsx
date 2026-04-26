// SpotCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

// maps category name to a CSS class for the coloured pill
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

function SpotCard({ spot }) {
  const navigate = useNavigate();

  return (
    <div className="spot-card" onClick={() => navigate(`/spot/${spot.id}`)}>
      <div className="spot-card-body">
        <h2>{spot.get("Name")}</h2>
        <span className={getCategoryClass(spot.get("Category"))}>
          {spot.get("Category")}
        </span>
        <p className="city">{spot.get("City")}</p>
        <p>{spot.get("Description")}</p>
        <p className="rating">★ {spot.get("Initial_Rating")} / 5</p>
        <p className="hours">{spot.get("Hours")}</p>
      </div>
    </div>
  );
}

export default SpotCard;