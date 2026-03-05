// TouristSpot.js
// Parse Model for the TouristSpot class
// Handles all CRUD operations for tourist spots
import Parse from "parse";

// CREATE - adds a new tourist spot to the database
export const createTouristSpot = (name, category, city, description, rating, openHours) => {
  const TouristSpot = Parse.Object.extend("TouristSpot");
  const spot = new TouristSpot();
  spot.set("name", name);
  spot.set("category", category);
  spot.set("city", city);
  spot.set("description", description);
  spot.set("rating", rating);
  spot.set("openHours", openHours);
  return spot.save().then((result) => {
    return result;
  });
};

// READ - get all tourist spots from the database
export const getAllTouristSpots = () => {
  const TouristSpot = Parse.Object.extend("TouristSpot");
  const query = new Parse.Query(TouristSpot);
  return query.find().then((results) => {
    return results;
  });
};

// READ - get a single tourist spot by id
export const getTouristSpotById = (id) => {
  const TouristSpot = Parse.Object.extend("TouristSpot");
  const query = new Parse.Query(TouristSpot);
  return query.get(id).then((result) => {
    return result;
  });
};

// DELETE - remove a tourist spot by id
export const deleteTouristSpot = (id) => {
  const TouristSpot = Parse.Object.extend("TouristSpot");
  const query = new Parse.Query(TouristSpot);
  return query.get(id).then((spot) => {
    return spot.destroy();
  });
};