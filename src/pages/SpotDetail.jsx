// SpotDetail.jsx
// Detail page for a single tourist spot
// Shows full spot info, all user reviews with hashtags, and lets you log a visit

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Parse from "parse";
import { getTouristSpotById } from "../models/TouristSpot";
import { getReviewsForSpot } from "../services/reviewService";
import { hasVisited } from "../services/userService";
import ReviewModal from "../components/ReviewModal";
import Toast from "../components/Toast";
import Navbar from "../components/Navbar";

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

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

export default function SpotDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [spot, setSpot]           = useState(null);
  const [reviews, setReviews]     = useState([]);
  const [visited, setVisited]     = useState(false);
  const [reviewSpot, setReviewSpot] = useState(null);
  const [toast, setToast]         = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, r, v] = await Promise.all([
          getTouristSpotById(id),
          getReviewsForSpot(id),
          hasVisited(id),
        ]);
        setSpot(s);
        setReviews(r);
        setVisited(v);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // collect all unique hashtags across all reviews for this spot
  const allTags = [...new Set(reviews.flatMap((r) => r.hashtags))];

  // average rating from reviews
  const avgRating = reviews.length > 0
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading-wrap"><div className="spinner" /> Loading…</div>
      </div>
    );
  }

  if (!spot) {
    return (
      <div>
        <Navbar />
        <div className="loading-wrap">Spot not found.</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <div className="spot-detail-page">

        {/* back button */}
        <button className="back-pill" onClick={() => navigate(-1)}>
          ← Back
        </button>

        {/* hero section */}
        <div className="spot-detail-hero">
          <div className="spot-detail-emoji">
            {spot.get("Category") === "food"     ? "🍽" :
             spot.get("Category") === "cafe"     ? "☕" :
             spot.get("Category") === "historic" ? "🏛" :
             spot.get("Category") === "nature"   ? "🌿" :
             spot.get("Category") === "culture"  ? "🎨" : "📍"}
          </div>
          <div className="spot-detail-hero-body">
            <span className={getCategoryClass(spot.get("Category"))}>
              {spot.get("Category")}
            </span>
            <h1 className="spot-detail-title">{spot.get("Name")}</h1>
            <div className="spot-detail-meta-row">
              <span className="spot-detail-city">
                📍 {spot.get("Neighborhood") ? `${spot.get("Neighborhood")}, ` : ""}{spot.get("City")}
              </span>
              {spot.get("Initial_Rating") && (
                <span className="spot-detail-rating">
                  ★ {spot.get("Initial_Rating")} official
                </span>
              )}
              {avgRating && (
                <span className="spot-detail-rating" style={{ color: "var(--jade)" }}>
                  ★ {avgRating} from {reviews.length} {reviews.length === 1 ? "visitor" : "visitors"}
                </span>
              )}
              <span className="price-range">{spot.get("Price_Range")}</span>
            </div>

            {/* added by badge — only shown to the user who added it */}
            {spot.get("addedBy") &&
              spot.get("addedBy").id === Parse.User.current()?.id && (
              <div className="added-by-badge">
                ✦ Added by you
              </div>
            )}

          </div>
        </div>

        <div className="spot-detail-body">
          <div className="spot-detail-main">

            {/* description */}
            <div className="detail-section">
              <div className="detail-section-label">About</div>
              <p className="detail-description">{spot.get("Description")}</p>
            </div>

            {/* insider tip */}
            {spot.get("Insider_Tip") && (
              <div className="insider-tip">
                <strong>Insider tip</strong>
                {spot.get("Insider_Tip")}
              </div>
            )}

            {/* community hashtags */}
            {allTags.length > 0 && (
              <div className="detail-section">
                <div className="detail-section-label">
                  Community tags
                  <span className="pref-label-hint"> — added by visitors like you</span>
                </div>
                <div className="detail-tags">
                  {allTags.map((tag) => (
                    <span key={tag} className="tag-pill">#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* visit button */}
            <div className="detail-visit-row">
              {visited ? (
                <div className="reviewed-badge" style={{ fontSize: 13, padding: "8px 16px" }}>
                  ✓ You've been here
                </div>
              ) : (
                <button
                  className="mark-visited-btn"
                  style={{ padding: "10px 24px", fontSize: 14 }}
                  onClick={() => setReviewSpot({
                    id:          spot.id,
                    name:        spot.get("Name"),
                    city:        spot.get("City"),
                    category:    spot.get("Category"),
                    subcategory: spot.get("Subcategory"),
                    priceRange:  spot.get("Price_Range"),
                  })}
                >
                  + I've been here — log this visit
                </button>
              )}
            </div>

            {/* reviews */}
            <div className="detail-section">
              <div className="detail-section-label">
                {reviews.length > 0
                  ? `${reviews.length} visitor ${reviews.length === 1 ? "review" : "reviews"}`
                  : "No reviews yet — be the first!"}
              </div>

              {reviews.length === 0 && (
                <div className="empty-state" style={{ padding: "24px 0" }}>
                  <div className="empty-icon">✍️</div>
                  <div className="empty-sub">
                    Visit this spot and leave the first review.
                  </div>
                </div>
              )}

              <div className="review-list">
                {reviews.map((r) => (
                  <div key={r.id} className="review-card">

                    {/* photo */}
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
                        <div className="review-spot-name">{r.username}</div>
                        <div className="review-spot-meta">{formatDate(r.date)}</div>
                      </div>
                      <div className="review-stars">
                        {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                      </div>
                    </div>

                    {r.comment && (
                      <p className="review-comment">{r.comment}</p>
                    )}

                    {r.hashtags.length > 0 && (
                      <div className="review-tags">
                        {r.hashtags.map((t) => (
                          <span key={t} className="tag-pill">#{t}</span>
                        ))}
                      </div>
                    )}

                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* sidebar */}
          <div className="spot-detail-sidebar">
            {spot.get("Hours") && (
              <div className="sidebar-card">
                <div className="detail-section-label">Hours</div>
                <div className="sidebar-value">{spot.get("Hours")}</div>
              </div>
            )}
            {spot.get("Best_Time") && (
              <div className="sidebar-card">
                <div className="detail-section-label">Best time to visit</div>
                <div className="sidebar-value">{spot.get("Best_Time")}</div>
              </div>
            )}
            {spot.get("Best_Season") && (
              <div className="sidebar-card">
                <div className="detail-section-label">Best season</div>
                <div className="sidebar-value">{spot.get("Best_Season")}</div>
              </div>
            )}
            {spot.get("Accessibility") && (
              <div className="sidebar-card">
                <div className="detail-section-label">Accessibility</div>
                <div className="sidebar-value">{spot.get("Accessibility")}</div>
              </div>
            )}
            {spot.get("Address") && (
              <div className="sidebar-card">
                <div className="detail-section-label">Address</div>
                <div className="sidebar-value">{spot.get("Address")}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* review modal */}
      {reviewSpot && (
        <ReviewModal
          spot={reviewSpot}
          onClose={() => setReviewSpot(null)}
          onSubmitted={(message) => {
            setVisited(true);
            setToast(message);
            setReviewSpot(null);
            // reload reviews
            getReviewsForSpot(id).then(setReviews);
          }}
        />
      )}

      {/* toast notification */}
      {toast && (
        <Toast message={toast} onDone={() => setToast(null)} />
      )}
    </div>
  );
}