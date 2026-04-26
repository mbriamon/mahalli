// reviewService.js
// Handles saving and loading reviews from the Review Parse class

import Parse from "parse";

// save a new review for a spot
export async function submitReview({ spotId, rating, comment, hashtags, imageUrl }) {
  const Review = Parse.Object.extend("Review");
  const review = new Review();
  review.set("user",     Parse.User.current());
  review.set("spot",     Parse.Object.extend("TouristSpot").createWithoutData(spotId));
  review.set("rating",   rating);
  review.set("comment",  comment);
  review.set("hashtags", hashtags);
  if (imageUrl) review.set("imageUrl", imageUrl);

  // mark the visit as reviewed
  const Visit = Parse.Object.extend("Visit");
  const visitQuery = new Parse.Query(Visit);
  visitQuery.equalTo("user", Parse.User.current());
  visitQuery.equalTo("spot", Parse.Object.extend("TouristSpot").createWithoutData(spotId));
  const visits = await visitQuery.find();
  if (visits.length > 0) {
    visits[0].set("reviewed", true);
    await visits[0].save();
  }

  return await review.save();
}

// get all reviews for a specific spot
export async function getReviewsForSpot(spotId) {
  const Review = Parse.Object.extend("Review");
  const query  = new Parse.Query(Review);
  query.equalTo("spot", Parse.Object.extend("TouristSpot").createWithoutData(spotId));
  query.include("user");
  query.descending("createdAt");
  const results = await query.find();
  return results.map((r) => ({
    id:       r.id,
    rating:   r.get("rating"),
    comment:  r.get("comment"),
    hashtags: r.get("hashtags") || [],
    imageUrl: r.get("imageUrl") || null,
    username: r.get("user")?.get("username") || "Anonymous",
    date:     r.get("createdAt"),
  }));
}

// get all reviews by the current user
export async function getMyReviews() {
  const Review = Parse.Object.extend("Review");
  const query  = new Parse.Query(Review);
  query.equalTo("user", Parse.User.current());
  query.include("spot");
  query.descending("createdAt");
  const results = await query.find();
  return results.map((r) => ({
    id:       r.id,
    rating:   r.get("rating"),
    comment:  r.get("comment"),
    hashtags: r.get("hashtags") || [],
    imageUrl: r.get("imageUrl") || null,
    date:     r.get("createdAt"),
    spot: {
      id:   r.get("spot").id,
      name: r.get("spot").get("Name"),
      city: r.get("spot").get("City"),
    },
  }));
}

// get all unique hashtags used by the current user across all reviews
export async function getMyHashtags() {
  const reviews = await getMyReviews();
  const tagCounts = {};
  reviews.forEach((r) => {
    r.hashtags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  // return sorted by frequency
  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));
}