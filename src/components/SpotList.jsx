// SpotList.jsx
// Child component of Home
// Receives spots as props and renders a SpotCard for each one
import React from "react";
import SpotCard from "./SpotCard";

function SpotList({ spots }) {
  return (
    <div className="spot-list">
      {/* map over spots array and render a card for each */}
      {spots.map((spot) => (
        <SpotCard key={spot.id} spot={spot} />
      ))}
    </div>
  );
}

export default SpotList;