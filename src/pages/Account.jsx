// Account.jsx
// User account page — travel diary, reviews, and preferences
// Diary view shows visits as personal journal entries with photos and tags

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Parse from "parse";
import Navbar from "../components/Navbar";
import PreferenceForm from "../components/PreferenceForm";
import { logoutUser } from "../services/authService";
import { getMyVisits, getPreferences } from "../services/userService";
import { getMyReviews, getMyHashtags } from "../services/reviewService";
import { getMyWishlist } from "../services/wishlistServices";

const TABS = ["Diary", "Reviews", "Saved", "Preferences"];

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

function formatMonth(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long", year: "numeric",
  });
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

export default function Account() {
  const navigate              = useNavigate();
  const [activeTab, setTab]   = useState("Diary");
  const [visits, setVisits]   = useState([]);
  const [reviews, setReviews] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(true);
  const user                  = Parse.User.current();
  const prefs                 = getPreferences();

  useEffect(() => {
    async function load() {
      try {
        const [v, r, h, w] = await Promise.all([
          getMyVisits(),
          getMyReviews(),
          getMyHashtags(),
          getMyWishlist(),
        ]);
        setVisits(v);
        setReviews(r);
        setHashtags(h);
        setWishlist(w);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleLogout() {
    await logoutUser();
    navigate("/auth");
  }

  // merge visits with their reviews for the diary view
  function getDiaryEntries() {
    return visits.map((visit) => {
      const review = reviews.find((r) => r.spot.id === visit.spot.id);
      return { ...visit, review: review || null };
    });
  }

  // group diary entries by month
  function groupByMonth(entries) {
    const groups = {};
    entries.forEach((entry) => {
      const month = formatMonth(entry.visitedAt);
      if (!groups[month]) groups[month] = [];
      groups[month].push(entry);
    });
    return groups;
  }

  const diaryEntries = getDiaryEntries();
  const grouped      = groupByMonth(diaryEntries);

  // cities visited
  const citiesVisited = [...new Set(visits.map((v) => v.spot?.city).filter(Boolean))];

  return (
    <div>
      <Navbar />

      {/* profile header */}
      <div className="account-header">
        <div className="account-avatar">
          {user?.get("username")?.slice(0, 2).toUpperCase() || "U"}
        </div>
        <div className="account-info">
          <div className="account-username">{user?.get("username")}</div>
          <div className="account-meta">
            {visits.length} places visited · {reviews.length} reviews · {citiesVisited.length} cities
          </div>

          {/* favourite hashtag badge */}
          {hashtags.length > 0 && (
            <div className="fav-hashtag-badge">
              <span className="fav-hashtag-icon">🏷</span>
              <span className="fav-hashtag-text">
                You're a{" "}
                <strong>#{hashtags[0].tag}</strong> traveller
              </span>
              <span className="fav-hashtag-sub">
                · your most used tag
              </span>
            </div>
          )}

          {/* top hashtags */}
          {hashtags.length > 0 && (
            <div className="account-tags">
              {hashtags.slice(0, 6).map(({ tag }) => (
                <span key={tag} className="tag-pill">#{tag}</span>
              ))}
            </div>
          )}
        </div>
        <button className="logout-btn" onClick={handleLogout}>Sign out</button>
      </div>

      {/* stats row */}
      <div className="account-stats">
        <div className="account-stat">
          <div className="stat-num">{visits.length}</div>
          <div className="stat-lbl">Places visited</div>
        </div>
        <div className="account-stat">
          <div className="stat-num">{reviews.length}</div>
          <div className="stat-lbl">Reviews written</div>
        </div>
        <div className="account-stat">
          <div className="stat-num">
            {reviews.length > 0
              ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
              : "—"}
          </div>
          <div className="stat-lbl">Avg rating</div>
        </div>
        <div className="account-stat">
          <div className="stat-num">{citiesVisited.length}</div>
          <div className="stat-lbl">Cities explored</div>
        </div>
      </div>

      {/* passport stamps */}
      {citiesVisited.length > 0 && (
        <div className="passport-strip">
          <div className="passport-strip-label">🛂 Cities explored</div>
          <div className="passport-stamps">
            {citiesVisited.map((city) => (
              <div key={city} className="passport-stamp">
                <div className="passport-stamp-inner">
                  <div className="passport-stamp-city">{city}</div>
                  <div className="passport-stamp-country">Jordan</div>
                  <div className="passport-stamp-count">
                    {visits.filter((v) => v.spot?.city === city).length} visit
                    {visits.filter((v) => v.spot?.city === city).length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* stats row */}
      <div className="account-stats">
        <div className="account-stat">
          <div className="stat-num">{visits.length}</div>
          <div className="stat-lbl">Places visited</div>
        </div>
        <div className="account-stat">
          <div className="stat-num">{reviews.length}</div>
          <div className="stat-lbl">Reviews written</div>
        </div>
        <div className="account-stat">
          <div className="stat-num">
            {reviews.length > 0
              ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
              : "—"}
          </div>
          <div className="stat-lbl">Avg rating</div>
        </div>
        <div className="account-stat">
          <div className="stat-num">{citiesVisited.length}</div>
          <div className="stat-lbl">Cities explored</div>
        </div>
      </div>

      {/* tab bar */}
      <div className="account-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`account-tab${activeTab === tab ? " active" : ""}`}
            onClick={() => setTab(tab)}
          >
            {tab === "Diary"       ? "📖 Diary"       :
             tab === "Reviews"     ? "✍️ Reviews"     :
             tab === "Saved"       ? "🔖 Saved"       :
             tab === "Preferences" ? "🎯 Preferences" : tab}
          </button>
        ))}
      </div>

      <div className="account-body">

        {/* ── Diary tab ── */}
        {activeTab === "Diary" && (
          <div>
            {loading && (
              <div className="loading-wrap"><div className="spinner" /></div>
            )}

            {!loading && visits.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📖</div>
                <div className="empty-title">Your diary is empty</div>
                <div className="empty-sub">
                  Visit spots and log them — they'll appear here as a personal travel journal.
                </div>
              </div>
            )}

            {/* timeline */}
            <div className="diary-timeline">
              {Object.entries(grouped).map(([month, entries]) => (
                <div key={month} className="diary-month-group">

                  {/* month milestone */}
                  <div className="diary-milestone">
                    <div className="diary-milestone-dot" />
                    <div className="diary-milestone-label">{month}</div>
                  </div>

                  {entries.map((entry, i) => (
                    <div key={entry.id} className="diary-timeline-row">
                      {/* spine connector */}
                      <div className="diary-spine">
                        <div className="diary-spine-line" />
                        <div className="diary-spine-node" />
                      </div>

                      {/* polaroid card */}
                      <div
                        className={`diary-polaroid ${i % 2 === 0 ? "tilt-left" : "tilt-right"}`}
                        onClick={() => navigate(`/spot/${entry.spot.id}`)}
                      >
                        {/* photo area */}
                        <div className="polaroid-photo-wrap">
                          {entry.review?.imageUrl ? (
                            <img
                              src={entry.review.imageUrl}
                              alt={entry.spot.name}
                              className="polaroid-photo"
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          ) : (
                            <div className="polaroid-photo-empty">
                              {entry.spot.category === "food"     ? "🍽" :
                               entry.spot.category === "cafe"     ? "☕" :
                               entry.spot.category === "historic" ? "🏛" :
                               entry.spot.category === "nature"   ? "🌿" :
                               entry.spot.category === "culture"  ? "🎨" : "📍"}
                            </div>
                          )}
                        </div>

                        {/* polaroid caption area */}
                        <div className="polaroid-body">
                          {/* category stamp */}
                          <div className="polaroid-stamp">
                            <span className={getCategoryClass(entry.spot.category)}>
                              {entry.spot.category}
                            </span>
                          </div>

                          {/* spot name in journal font */}
                          <div className="polaroid-name">{entry.spot.name}</div>
                          <div className="polaroid-location">📍 {entry.spot.city}</div>

                          {/* date in margin style */}
                          <div className="polaroid-date">{formatDate(entry.visitedAt)}</div>

                          {/* review content */}
                          {entry.review ? (
                            <div className="polaroid-review">
                              <div className="polaroid-stars">
                                {"★".repeat(entry.review.rating)}
                                {"☆".repeat(5 - entry.review.rating)}
                              </div>
                              {entry.review.comment && (
                                <div className="polaroid-comment">
                                  "{entry.review.comment}"
                                </div>
                              )}
                              {entry.review.hashtags.length > 0 && (
                                <div className="polaroid-tags">
                                  {entry.review.hashtags.map((t) => (
                                    <span key={t} className="tag-pill">#{t}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="polaroid-no-review">
                              tap to add a review ✏️
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Reviews tab ── */}
        {activeTab === "Reviews" && (
          <div>
            {loading && (
              <div className="loading-wrap"><div className="spinner" /></div>
            )}
            {!loading && reviews.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">✍️</div>
                <div className="empty-title">No reviews yet</div>
                <div className="empty-sub">
                  When you visit a spot and leave a review it will appear here.
                </div>
              </div>
            )}
            <div className="review-list">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="review-card"
                  onClick={() => navigate(`/spot/${r.spot.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  {r.imageUrl && (
                    <img
                      src={r.imageUrl}
                      alt="visit"
                      className="review-photo"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  )}
                  <div className="review-card-header">
                    <div>
                      <div className="review-spot-name">{r.spot.name}</div>
                      <div className="review-spot-meta">{r.spot.city}</div>
                    </div>
                    <div className="review-stars">
                      {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                    </div>
                  </div>
                  {r.comment && (
                    <p className="review-comment">"{r.comment}"</p>
                  )}
                  {r.hashtags.length > 0 && (
                    <div className="review-tags">
                      {r.hashtags.map((t) => (
                        <span key={t} className="tag-pill">#{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="review-date">
                    {formatDate(r.date)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Saved tab ── */}
        {activeTab === "Saved" && (
          <div>
            {loading && (
              <div className="loading-wrap"><div className="spinner" /></div>
            )}

            {!loading && wishlist.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🔖</div>
                <div className="empty-title">No saved spots yet</div>
                <div className="empty-sub">
                  Tap the ♡ on any spot in Explore to save it here for later.
                </div>
              </div>
            )}

            <div className="wishlist-grid">
              {wishlist.map((w) => (
                <div
                  key={w.id}
                  className="wishlist-card"
                  onClick={() => navigate(`/spot/${w.spot.id}`)}
                >
                  <div className="wishlist-card-emoji">
                    {w.spot.category === "food"     ? "🍽" :
                     w.spot.category === "cafe"     ? "☕" :
                     w.spot.category === "historic" ? "🏛" :
                     w.spot.category === "nature"   ? "🌿" :
                     w.spot.category === "culture"  ? "🎨" : "📍"}
                  </div>
                  <div className="wishlist-card-body">
                    <div className="wishlist-card-name">{w.spot.name}</div>
                    <div className="wishlist-card-meta">
                      {w.spot.city}
                      {w.spot.rating ? ` · ★ ${w.spot.rating}` : ""}
                    </div>
                    {w.spot.priceRange && (
                      <span className="price-range">{w.spot.priceRange}</span>
                    )}
                    {w.spot.insiderTip && (
                      <div className="wishlist-tip">
                        💡 {w.spot.insiderTip}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}



        {/* ── Preferences tab ── */}
        {activeTab === "Preferences" && (
          <div>
            <div className="pref-intro">
              <div className="pref-intro-title">Your taste profile</div>
              <div className="pref-intro-sub">
                These drive what shows up on your For You page. They update
                automatically as you visit spots and add tags — but you can
                always adjust them manually here too.
              </div>

              {/* show what's influencing preferences */}
              {hashtags.length > 0 && (
                <div className="pref-influence-box">
                  <div className="pref-influence-title">
                    🎯 What's shaping your feed right now
                  </div>
                  <div className="pref-influence-sub">
                    Based on your visits and tags, your top signals are:
                  </div>
                  <div className="pref-chips" style={{ marginTop: 8 }}>
                    {hashtags.slice(0, 8).map(({ tag, count }) => (
                      <div key={tag} className="pref-chip active">
                        #{tag}
                        <span style={{ opacity: .6, marginLeft: 4, fontSize: 11 }}>
                          ×{count}
                        </span>
                      </div>
                    ))}
                  </div>
                  {prefs.categories.length > 0 && (
                    <div style={{ marginTop: 10, fontSize: 12, color: "var(--ink-m)" }}>
                      Top categories: {prefs.categories.join(", ")}
                      {prefs.cities.length > 0 && ` · Cities: ${prefs.cities.join(", ")}`}
                    </div>
                  )}
                </div>
              )}
            </div>

            <PreferenceForm
              initial={prefs}
              onSaved={() => {}}
            />
          </div>
        )}

      </div>
    </div>
  );
}