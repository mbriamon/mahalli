// SpotDetail.jsx
// Detail page for a single tourist spot
// Loads spot data from Parse using the id from the URL
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTouristSpotById } from "../models/TouristSpot";

function SpotDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [spot, setSpot] = useState(null);

  // load the spot by id from the URL params
  useEffect(() => {
    getTouristSpotById(id).then((data) => {
      setSpot(data);
    });
  }, [id]);

  // show loading message while data is being fetched
  if (!spot) {
    return <p>Loading...</p>;
  }

  return (
    <div className="spot-detail">
      <button onClick={() => navigate("/")}>← Back</button>
      <h1>{spot.get("name")}</h1>
      <p className="category">{spot.get("category")}</p>
      <p className="city">{spot.get("city")}</p>
      <p>{spot.get("description")}</p>
      <p className="rating">Rating: {spot.get("rating")} / 5</p>
      <p className="hours">{spot.get("openHours")}</p>
    </div>
  );
}

export default SpotDetail;