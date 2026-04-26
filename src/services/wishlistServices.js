// wishlistService.js
// Handles saving and loading wishlist spots from the Wishlist Parse class

import Parse from "parse";

// add a spot to the wishlist
export async function addToWishlist(spotId) {
  const Wishlist = Parse.Object.extend("Wishlist");
  const entry    = new Wishlist();
  entry.set("user", Parse.User.current());
  entry.set("spot", Parse.Object.extend("TouristSpot").createWithoutData(spotId));
  return await entry.save();
}

// remove a spot from the wishlist
export async function removeFromWishlist(spotId) {
  const Wishlist = Parse.Object.extend("Wishlist");
  const query    = new Parse.Query(Wishlist);
  query.equalTo("user", Parse.User.current());
  query.equalTo("spot", Parse.Object.extend("TouristSpot").createWithoutData(spotId));
  const results = await query.find();
  await Promise.all(results.map((r) => r.destroy()));
}

// check if a spot is in the wishlist
export async function isWishlisted(spotId) {
  const Wishlist = Parse.Object.extend("Wishlist");
  const query    = new Parse.Query(Wishlist);
  query.equalTo("user", Parse.User.current());
  query.equalTo("spot", Parse.Object.extend("TouristSpot").createWithoutData(spotId));
  const count = await query.count();
  return count > 0;
}

// get all wishlisted spots for current user
export async function getMyWishlist() {
  const Wishlist = Parse.Object.extend("Wishlist");
  const query    = new Parse.Query(Wishlist);
  query.equalTo("user", Parse.User.current());
  query.include("spot");
  query.descending("createdAt");
  const results = await query.find();
  return results.map((w) => ({
    id:   w.id,
    spot: {
      id:          w.get("spot").id,
      name:        w.get("spot").get("Name"),
      category:    w.get("spot").get("Category"),
      city:        w.get("spot").get("City"),
      description: w.get("spot").get("Description"),
      rating:      w.get("spot").get("Initial_Rating"),
      priceRange:  w.get("spot").get("Price_Range"),
      insiderTip:  w.get("spot").get("Insider_Tip"),
    },
  }));
}

