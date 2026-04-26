// userService.js
// Handles saving and loading user preferences and visit history from Parse

import Parse from "parse";

// save preference selections to the current user object
export async function savePreferences(prefs) {
  const user = Parse.User.current();
  user.set("prefCategories",     prefs.categories);
  user.set("prefSubcategories",  prefs.subcategories);
  user.set("prefPriceRange",     prefs.priceRange);
  user.set("prefCities",         prefs.cities);
  user.set("prefBestTime",       prefs.bestTime);
  user.set("prefBestSeason",     prefs.bestSeason);
  user.set("prefAccessibility",  prefs.accessibility);
  user.set("onboardingComplete", true);
  return await user.save();
}

// load preferences from the current user object
export function getPreferences() {
  const user = Parse.User.current();
  if (!user) return null;
  return {
    categories:    user.get("prefCategories")    || [],
    subcategories: user.get("prefSubcategories") || [],
    priceRange:    user.get("prefPriceRange")    || [],
    cities:        user.get("prefCities")        || [],
    bestTime:      user.get("prefBestTime")      || [],
    bestSeason:    user.get("prefBestSeason")    || [],
    accessibility: user.get("prefAccessibility") || false,
  };
}

// check if the current user has completed onboarding
export function hasCompletedOnboarding() {
  const user = Parse.User.current();
  return user?.get("onboardingComplete") || false;
}

// auto-update preferences based on a visited spot and its review
// called after a review is submitted — silently merges new data in
export async function updatePreferencesFromVisit(spot, hashtags, rating) {
  const user = Parse.User.current();
  if (!user) return null;

  const current = getPreferences();

  // merge category
  const cat = spot.category;
  const cats = current.categories.includes(cat)
    ? current.categories
    : [...current.categories, cat];

  // merge subcategory
  const subcat = spot.subcategory;
  const subcats = subcat && !current.subcategories.includes(subcat)
    ? [...current.subcategories, subcat]
    : current.subcategories;

  // merge city
  const city = spot.city;
  const cities = current.cities.includes(city)
    ? current.cities
    : [...current.cities, city];

  // merge price range if rated highly
  const price = spot.priceRange;
  const prices = rating >= 4 && price && !current.priceRange.includes(price)
    ? [...current.priceRange, price]
    : current.priceRange;

  user.set("prefCategories",    cats);
  user.set("prefSubcategories", subcats);
  user.set("prefCities",        cities);
  user.set("prefPriceRange",    prices);
  user.set("onboardingComplete", true);

  return await user.save();
}

// generate a personalised toast message based on review content
export function generateToastMessage(hashtags, rating, spotName) {
  if (hashtags.length > 0) {
    const tag = hashtags[0];
    const tagMessages = [
      `Your feed now knows you love #${tag} spots ✨`,
      `We added #${tag} to your taste profile 🎯`,
      `Spots tagged #${tag} will show up more for you 🗺`,
      `#${tag} vibes noted — your feed just got more personal 💫`,
    ];
    return tagMessages[Math.floor(Math.random() * tagMessages.length)];
  }
  if (rating >= 5) return `You loved ${spotName}! Finding you more like it 🌟`;
  if (rating >= 4) return `Great pick! Your taste profile just got sharper 📍`;
  if (rating <= 2) return `Thanks for the honest rating — we'll steer you better 🧭`;
  return `Visit logged. Your recommendations are getting smarter 🌍`;
}

// record a visit to the Visit class
export async function recordVisit(spotId) {
  // check if already visited to avoid duplicates
  const already = await hasVisited(spotId);
  if (already) return null;

  const Visit = Parse.Object.extend("Visit");
  const visit = new Visit();
  visit.set("user",      Parse.User.current());
  visit.set("spot",      Parse.Object.extend("TouristSpot").createWithoutData(spotId));
  visit.set("visitedAt", new Date());
  visit.set("reviewed",  false);
  return await visit.save();
}

// get all visits for the current user, newest first
export async function getMyVisits() {
  const Visit = Parse.Object.extend("Visit");
  const query = new Parse.Query(Visit);
  query.equalTo("user", Parse.User.current());
  query.include("spot");
  query.descending("visitedAt");
  const results = await query.find();
  return results.map((v) => ({
    id:        v.id,
    visitedAt: v.get("visitedAt"),
    reviewed:  v.get("reviewed"),
    spot: {
      id:          v.get("spot").id,
      name:        v.get("spot").get("Name"),
      category:    v.get("spot").get("Category"),
      subcategory: v.get("spot").get("Subcategory"),
      city:        v.get("spot").get("City"),
      description: v.get("spot").get("Description"),
      rating:      v.get("spot").get("Initial_Rating"),
      priceRange:  v.get("spot").get("Price_Range"),
    },
  }));
}

// check if user has already visited a specific spot
export async function hasVisited(spotId) {
  const Visit = Parse.Object.extend("Visit");
  const query = new Parse.Query(Visit);
  query.equalTo("user", Parse.User.current());
  query.equalTo("spot", Parse.Object.extend("TouristSpot").createWithoutData(spotId));
  const count = await query.count();
  return count > 0;
}