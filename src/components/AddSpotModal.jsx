// AddSpotModal.jsx
// Floating modal for submitting a new tourist spot
// Saves directly to TouristSpot class in Back4App
// Immediately prompts for a review after submission

import React, { useState } from "react";
import Parse from "parse";
import { submitReview } from "../services/reviewService";
import { recordVisit } from "../services/userService";

const CATEGORIES = ["food", "cafe", "historic", "nature", "culture"];

export default function AddSpotModal({ onClose, onAdded }) {
  const [step, setStep]         = useState("form"); // "form" | "review"
  const [newSpotId, setNewSpotId] = useState(null);
  const [newSpotName, setNewSpotName] = useState("");

  // form fields
  const [name,        setName]        = useState("");
  const [category,    setCategory]    = useState("");
  const [city,        setCity]        = useState("");
  const [description, setDescription] = useState("");
  const [lat,         setLat]         = useState("");
  const [lng,         setLng]         = useState("");
  const [address,     setAddress]     = useState("");
  const [insiderTip,  setInsiderTip]  = useState("");
  const [priceRange,  setPriceRange]  = useState("free");
  const [hours,       setHours]       = useState("");

  // review fields
  const [rating,   setRating]   = useState(0);
  const [comment,  setComment]  = useState("");
  const [tagInput, setTagInput] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [imageUrl, setImageUrl] = useState("");

  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  // ── Step 1: save the spot ──────────────────────────
  async function handleSpotSubmit(e) {
    e.preventDefault();
    if (!name || !category || !city || !lat || !lng) {
      setError("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const TouristSpot = Parse.Object.extend("TouristSpot");
      const spot        = new TouristSpot();
      spot.set("Name",        name);
      spot.set("Category",    category);
      spot.set("City",        city);
      spot.set("Description", description);
      spot.set("Latitude",    parseFloat(lat));
      spot.set("Longitude",   parseFloat(lng));
      spot.set("Address",     address);
      spot.set("Insider_Tip", insiderTip);
      spot.set("Price_Range", priceRange);
      spot.set("Hours",       hours);
      spot.set("Status",      "active");
      spot.set("addedBy",     Parse.User.current());

      const saved = await spot.save();
      setNewSpotId(saved.id);
      setNewSpotName(name);

      // record as visited since they're adding it
      await recordVisit(saved.id);

      // move to review step
      setStep("review");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Step 2: save the review ────────────────────────
  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (rating === 0) { setError("Please select a rating."); return; }
    setSaving(true);
    setError("");
    try {
      await submitReview({
        spotId:   newSpotId,
        rating,
        comment,
        hashtags,
        imageUrl,
      });
      if (onAdded) onAdded();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleTagKeyDown(e) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
    }
  }
  function addTag(raw) {
    const tag = raw.trim().replace(/^#/, "").toLowerCase();
    if (tag && !hashtags.includes(tag)) setHashtags((p) => [...p, tag]);
    setTagInput("");
  }
  function removeTag(tag) {
    setHashtags(hashtags.filter((t) => t !== tag));
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">

        {/* ── STEP 1: spot form ── */}
        {step === "form" && (
          <>
            <div className="modal-header">
              <div>
                <div className="modal-title">Add a new spot</div>
                <div className="modal-subtitle">
                  It will appear on the map and in the feed immediately.
                </div>
              </div>
              <button className="modal-close" onClick={onClose}>×</button>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSpotSubmit}>

              {/* name */}
              <div className="pref-group">
                <div className="pref-group-label">
                  Spot name <span className="required-star">*</span>
                </div>
                <input
                  className="review-url-input"
                  placeholder="e.g. Rumi Cafe & Books"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* category */}
              <div className="pref-group">
                <div className="pref-group-label">
                  Category <span className="required-star">*</span>
                </div>
                <div className="pref-chips">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`pref-chip${category === c ? " active" : ""}`}
                      onClick={() => setCategory(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* city */}
              <div className="pref-group">
                <div className="pref-group-label">
                  City <span className="required-star">*</span>
                </div>
                <input
                  className="review-url-input"
                  placeholder="e.g. Amman"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              {/* lat / lng */}
              <div className="add-spot-coords">
                <div className="pref-group" style={{ flex: 1 }}>
                  <div className="pref-group-label">
                    Latitude <span className="required-star">*</span>
                  </div>
                  <input
                    className="review-url-input"
                    placeholder="e.g. 31.9566"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    required
                  />
                </div>
                <div className="pref-group" style={{ flex: 1 }}>
                  <div className="pref-group-label">
                    Longitude <span className="required-star">*</span>
                  </div>
                  <input
                    className="review-url-input"
                    placeholder="e.g. 35.9263"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="coords-hint">
                💡 Find coordinates by right-clicking any location on Google Maps.
              </div>

              {/* description */}
              <div className="pref-group">
                <div className="pref-group-label">Description</div>
                <textarea
                  className="review-textarea"
                  placeholder="What makes this place special?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* price range */}
              <div className="pref-group">
                <div className="pref-group-label">Price range</div>
                <div className="pref-chips">
                  {["free", "budget", "moderate", "upscale"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`pref-chip${priceRange === p ? " active" : ""}`}
                      onClick={() => setPriceRange(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* optional fields */}
              <div className="add-spot-coords">
                <div className="pref-group" style={{ flex: 1 }}>
                  <div className="pref-group-label">Hours</div>
                  <input
                    className="review-url-input"
                    placeholder="e.g. Daily 08:00-22:00"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                  />
                </div>
                <div className="pref-group" style={{ flex: 1 }}>
                  <div className="pref-group-label">Address</div>
                  <input
                    className="review-url-input"
                    placeholder="Street or landmark"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              {/* insider tip */}
              <div className="pref-group">
                <div className="pref-group-label">Insider tip</div>
                <input
                  className="review-url-input"
                  placeholder="A local secret worth sharing…"
                  value={insiderTip}
                  onChange={(e) => setInsiderTip(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="auth-submit"
                  style={{ flex: 1 }}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Add spot →"}
                </button>
              </div>

            </form>
          </>
        )}

        {/* ── STEP 2: review form ── */}
        {step === "review" && (
          <>
            <div className="modal-header">
              <div>
                <div className="modal-title">🎉 Spot added!</div>
                <div className="modal-subtitle">
                  {newSpotName} is now live. Want to leave the first review?
                </div>
              </div>
              <button className="modal-close" onClick={onClose}>×</button>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleReviewSubmit}>

              {/* stars */}
              <div className="pref-group">
                <div className="pref-group-label">Your rating</div>
                <div className="star-row">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`star-btn${rating >= s ? " active" : ""}`}
                      onClick={() => setRating(s)}
                    >
                      ★
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="star-label">{rating} / 5</span>
                  )}
                </div>
              </div>

              {/* comment */}
              <div className="pref-group">
                <div className="pref-group-label">Your thoughts (optional)</div>
                <textarea
                  className="review-textarea"
                  placeholder="What makes this place special?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
              </div>

              {/* hashtags */}
              <div className="pref-group">
                <div className="pref-group-label">
                  Tags
                  <span className="pref-label-hint"> — press space or enter</span>
                </div>
                <div className="tag-input-wrap">
                  {hashtags.map((tag) => (
                    <span key={tag} className="tag-pill">
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)}>×</button>
                    </span>
                  ))}
                  <input
                    className="tag-input"
                    placeholder="#hidden-gem"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => tagInput.trim() && addTag(tagInput)}
                  />
                </div>
              </div>

              {/* image url */}
              <div className="pref-group">
                <div className="pref-group-label">Photo (optional)</div>
                <input
                  className="review-url-input"
                  type="url"
                  placeholder="Paste an image URL…"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="preview"
                    className="image-preview"
                    style={{ marginTop: 8 }}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={onClose}
                >
                  Skip for now
                </button>
                <button
                  type="submit"
                  className="auth-submit"
                  style={{ flex: 1 }}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Submit review ✓"}
                </button>
              </div>

            </form>
          </>
        )}

      </div>
    </div>
  );
}