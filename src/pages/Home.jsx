// Home.jsx
// For You page — curated spot recommendations based on user preferences and hashtags

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ReviewModal from "../components/ReviewModal";
import Toast from "../components/Toast";
import { getAllTouristSpots } from "../models/TouristSpot";
import { getPreferences, hasVisited } from "../services/userService";
import { getMyHashtags } from "../services/reviewService";
import Parse from "parse";

function scoreSpot(spot, prefs, myHashtags) {
  let score = 0;
  const cat    = spot.get("Category")    || "";
  const subcat = spot.get("Subcategory") || "";
  const price  = spot.get("Price_Range") || "";
  const city   = spot.get("City")        || "";
  const time   = spot.get("Best_Time")   || "";
  const season = spot.get("Best_Season") || "";

  if (prefs.categories.includes(cat))       score += 3;
  if (prefs.subcategories.includes(subcat)) score += 2;
  if (prefs.priceRange.includes(price))     score += 2;
  if (prefs.cities.includes(city))          score += 2;
  if (prefs.bestTime.includes(time))        score += 1;
  if (prefs.bestSeason.includes(season))    score += 1;

  // bonus score from user's hashtag history matching spot subcategory or category
  myHashtags.forEach(({ tag, count }) => {
    if (cat.toLowerCase().includes(tag) ||
        subcat.toLowerCase().includes(tag)) {
      score += count * 0.5;
    }
  });

  return score;
}

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

function getEmoji(cat) {
  switch ((cat || "").toLowerCase()) {
    case "food":     return "🍽";
    case "cafe":     return "☕";
    case "historic": return "🏛";
    case "nature":   return "🌿";
    case "culture":  return "🎨";
    default:         return "📍";
  }
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export default function Home() {
  const navigate                    = useNavigate();
  const [allSpots, setAllSpots]     = useState([]);
  const [curated, setCurated]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [reviewSpot, setReviewSpot] = useState(null);
  const [toast, setToast]           = useState(null);
  const [visitedIds, setVisitedIds] = useState(new Set());
  const [myHashtags, setMyHashtags] = useState([]);
  const prefs                       = getPreferences();
  const user                        = Parse.User.current();

  useEffect(() => {
    async function load() {
      const [spots, tags] = await Promise.all([
        getAllTouristSpots(),
        getMyHashtags(),
      ]);
      setAllSpots(spots);
      setMyHashtags(tags);

      const scored = spots
        .map((s) => ({ spot: s, score: scoreSpot(s, prefs, tags) }))
        .sort((a, b) =>
          b.score - a.score ||
          b.spot.get("Initial_Rating") - a.spot.get("Initial_Rating")
        );
      setCurated(scored.map((s) => s.spot));

      // check visited status for top 20
      const visited = new Set();
      await Promise.all(
        spots.slice(0, 20).map(async (s) => {
          const seen = await hasVisited(s.id);
          if (seen) visited.add(s.id);
        })
      );
      setVisitedIds(visited);
      setLoading(false);
    }
    load();
  }, []);

  const hasPrefs = prefs &&
    (prefs.categories.length > 0 ||
     prefs.cities.length > 0 ||
     prefs.priceRange.length > 0);

  const topPicks   = curated.slice(0, 6);
  const hiddenGems = allSpots
    .filter((s) =>
      ["free", "budget"].includes(s.get("Price_Range")) &&
      s.get("Initial_Rating") >= 4.5
    )
    .slice(0, 4);
  const citySpots = hasPrefs && prefs.cities.length > 0
    ? allSpots.filter((s) => prefs.cities.includes(s.get("City"))).slice(0, 4)
    : [];

  // hashtag-driven section — spots matching user's top tags
  const tagSpots = myHashtags.length > 0
    ? allSpots
        .filter((s) => {
          const cat    = (s.get("Category")    || "").toLowerCase();
          const subcat = (s.get("Subcategory") || "").toLowerCase();
          return myHashtags.slice(0, 3).some(
            ({ tag }) => cat.includes(tag) || subcat.includes(tag)
          );
        })
        .slice(0, 4)
    : [];

  function FeaturedCard({ spot }) {
    const isVisited = visitedIds.has(spot.id);
    return (
      <div className="featured-card" onClick={() => navigate(`/spot/${spot.id}`)}>
        <div className="featured-card-emoji">{getEmoji(spot.get("Category"))}</div>
        <div className="featured-card-body">
          <span className={getCategoryClass(spot.get("Category"))}>
            {spot.get("Category")}
          </span>
          <h2 className="featured-card-name">{spot.get("Name")}</h2>
          <p className="featured-card-city">📍 {spot.get("City")}</p>
          <p className="featured-card-desc">{spot.get("Description")}</p>
          {spot.get("Insider_Tip") && (
            <div className="featured-insider-tip">
              💡 {spot.get("Insider_Tip")}
            </div>
          )}
          <div className="featured-card-foot">
            <span className="rating">★ {spot.get("Initial_Rating")}</span>
            <span className="price-range">{spot.get("Price_Range")}</span>
            {isVisited ? (
              <span className="reviewed-badge">✓ Visited</span>
            ) : (
              <button
                className="mark-visited-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setReviewSpot({
                    id:          spot.id,
                    name:        spot.get("Name"),
                    city:        spot.get("City"),
                    category:    spot.get("Category"),
                    subcategory: spot.get("Subcategory"),
                    priceRange:  spot.get("Price_Range"),
                  });
                }}
              >
                + Mark visited
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  function MiniCard({ spot }) {
    return (
      <div className="mini-card" onClick={() => navigate(`/spot/${spot.id}`)}>
        <div className="mini-card-emoji">{getEmoji(spot.get("Category"))}</div>
        <div className="mini-card-body">
          <div className="mini-card-name">{spot.get("Name")}</div>
          <div className="mini-card-meta">
            {spot.get("City")} · ★ {spot.get("Initial_Rating")}
          </div>
          <span className={getCategoryClass(spot.get("Category"))}>
            {spot.get("Category")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      {/* personalised greeting */}
      <div className="home-hero">
        <div className="home-hero-inner">
          <div className="home-greeting">
            Good {getTimeOfDay()},{" "}
            <span style={{ color: "var(--terra)" }}>
              {user?.get("username")}
            </span> 👋
          </div>
          <div className="home-subgreeting">
            {hasPrefs
              ? "Here's what we picked for you today based on your preferences."
              : "Set your preferences on the Account page to get personalised picks."}
          </div>

          {/* preference tags */}
          {hasPrefs && (
            <div className="home-pref-tags">
              {prefs.categories.map((c) => (
                <span key={c} className="hero-tag">{c}</span>
              ))}
              {prefs.priceRange.map((p) => (
                <span key={p} className="hero-tag">{p}</span>
              ))}
            </div>
          )}

          {/* hashtag signals — show what's driving the feed */}
          {myHashtags.length > 0 && (
            <div className="home-hashtag-signal">
              <span className="home-hashtag-signal-label">
                🎯 Your feed is also shaped by your tags:
              </span>
              <div className="home-hashtag-signal-tags">
                {myHashtags.slice(0, 6).map(({ tag, count }) => (
                  <span key={tag} className="hashtag-signal-pill">
                    #{tag}
                    <span className="hashtag-count">×{count}</span>
                  </span>
                ))}
              </div>
              <span
                className="home-hashtag-signal-link"
                onClick={() => navigate("/account")}
              >
                Edit in Account →
              </span>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-wrap">
          <div className="spinner" /> Loading your picks…
        </div>
      ) : (
        <div className="home-feed">

          {/* top picks */}
          <div className="feed-section">
            <div className="feed-section-header">
              <div className="feed-section-title">
                {hasPrefs ? "✦ Top picks for you" : "✦ Highest rated spots"}
              </div>
              <button className="feed-see-all" onClick={() => navigate("/explore")}>
                See all →
              </button>
            </div>
            <div className="featured-grid">
              {topPicks.map((spot) => (
                <FeaturedCard key={spot.id} spot={spot} />
              ))}
            </div>
          </div>

          {/* hashtag-driven section */}
          {tagSpots.length > 0 && (
            <div className="feed-section">
              <div className="feed-section-header">
                <div className="feed-section-title">
                  🏷 Because you tagged{" "}
                  <span style={{ color: "var(--terra)" }}>
                    #{myHashtags[0]?.tag}
                  </span>
                </div>
              </div>
              <div className="mini-grid">
                {tagSpots.map((spot) => (
                  <MiniCard key={spot.id} spot={spot} />
                ))}
              </div>
            </div>
          )}

          {/* hidden gems */}
          {hiddenGems.length > 0 && (
            <div className="feed-section">
              <div className="feed-section-header">
                <div className="feed-section-title">💎 Hidden gems</div>
                <button className="feed-see-all" onClick={() => navigate("/explore")}>
                  See all →
                </button>
              </div>
              <div className="mini-grid">
                {hiddenGems.map((spot) => (
                  <MiniCard key={spot.id} spot={spot} />
                ))}
              </div>
            </div>
          )}

          {/* based on your cities */}
          {citySpots.length > 0 && (
            <div className="feed-section">
              <div className="feed-section-header">
                <div className="feed-section-title">
                  📍 In {prefs.cities.slice(0, 2).join(" & ")}
                </div>
              </div>
              <div className="mini-grid">
                {citySpots.map((spot) => (
                  <MiniCard key={spot.id} spot={spot} />
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* review modal */}
      {reviewSpot && (
        <ReviewModal
          spot={reviewSpot}
          onClose={() => setReviewSpot(null)}
          onSubmitted={(message) => {
            setVisitedIds((prev) => new Set([...prev, reviewSpot.id]));
            setToast(message);
            setReviewSpot(null);
          }}
        />
      )}

      {/* toast */}
      {toast && (
        <Toast message={toast} onDone={() => setToast(null)} />
      )}
    </div>
  );
}