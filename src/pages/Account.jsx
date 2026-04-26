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

const TABS = ["Diary", "Reviews", "Preferences"];

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
        const [v, r, h] = await Promise.all([
          getMyVisits(),
          getMyReviews(),
          getMyHashtags(),
        ]);
        setVisits(v);
        setReviews(r);
        setHashtags(h);
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

            {/* grouped by month */}
            {Object.entries(grouped).map(([month, entries]) => (
              <div key={month} className="diary-month-group">
                <div className="diary-month-label">{month}</div>
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="diary-card"
                    onClick={() => navigate(`/spot/${entry.spot.id}`)}
                  >
                    {/* photo if exists */}
                    {entry.review?.imageUrl && (
                      <img
                        src={entry.review.imageUrl}
                        alt={entry.spot.name}
                        className="diary-photo"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    )}

                    <div className="diary-card-body">
                      {/* date stamp */}
                      <div className="diary-date">{formatDate(entry.visitedAt)}</div>

                      {/* spot info */}
                      <div className="diary-spot-name">{entry.spot.name}</div>
                      <div className="diary-spot-meta">
                        📍 {entry.spot.city}
                        {entry.spot.category && ` · ${entry.spot.category}`}
                      </div>

                      {/* review content */}
                      {entry.review ? (
                        <div className="diary-review-content">
                          {/* stars */}
                          <div className="diary-stars">
                            {"★".repeat(entry.review.rating)}
                            {"☆".repeat(5 - entry.review.rating)}
                            <span className="diary-rating-num">
                              {entry.review.rating} / 5
                            </span>
                          </div>

                          {/* comment */}
                          {entry.review.comment && (
                            <p className="diary-comment">
                              "{entry.review.comment}"
                            </p>
                          )}

                          {/* hashtags */}
                          {entry.review.hashtags.length > 0 && (
                            <div className="diary-tags">
                              {entry.review.hashtags.map((t) => (
                                <span key={t} className="tag-pill">#{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="diary-no-review">
                          No review written yet —{" "}
                          <span style={{ color: "var(--terra)", fontWeight: 500 }}>
                            tap to add one
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
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