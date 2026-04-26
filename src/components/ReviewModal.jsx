// ReviewModal.jsx
// Modal for logging a visit — collects rating, comment, hashtags, and image URL
// Saves to Review and Visit classes, then auto-updates user preferences

import React, { useState } from "react";
import { submitReview } from "../services/reviewService";
import { recordVisit, updatePreferencesFromVisit, generateToastMessage } from "../services/userService";

export default function ReviewModal({ spot, onClose, onSubmitted }) {
  const [rating,    setRating]   = useState(0);
  const [comment,   setComment]  = useState("");
  const [tagInput,  setTagInput] = useState("");
  const [hashtags,  setHashtags] = useState([]);
  const [imageUrl,  setImageUrl] = useState("");
  const [saving,    setSaving]   = useState(false);
  const [error,     setError]    = useState("");

  // add tag on space or enter
  function handleTagKeyDown(e) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
    }
  }

  function addTag(raw) {
    const tag = raw.trim().replace(/^#/, "").toLowerCase();
    if (tag && !hashtags.includes(tag)) {
      setHashtags((prev) => [...prev, tag]);
    }
    setTagInput("");
  }

  function removeTag(tag) {
    setHashtags(hashtags.filter((t) => t !== tag));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) { setError("Please select a rating."); return; }
    setSaving(true);
    setError("");
    try {
      await recordVisit(spot.id);
      await submitReview({ spotId: spot.id, rating, comment, hashtags, imageUrl });

      // auto-update preferences based on this visit
      await updatePreferencesFromVisit(spot, hashtags, rating);

      // generate personalised toast message
      const message = generateToastMessage(hashtags, rating, spot.name);

      if (onSubmitted) onSubmitted(message);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {/* header */}
        <div className="modal-header">
          <div>
            <div className="modal-title">You visited this spot!</div>
            <div className="modal-subtitle">{spot.name} · {spot.city}</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* star rating */}
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
              {rating > 0 && <span className="star-label">{rating} / 5</span>}
            </div>
          </div>

          {/* comment */}
          <div className="pref-group">
            <div className="pref-group-label">Your thoughts (optional)</div>
            <textarea
              className="review-textarea"
              placeholder="What made this place special? Any tips for other visitors?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          {/* hashtags */}
          <div className="pref-group">
            <div className="pref-group-label">
              Add tags
              <span className="pref-label-hint"> — press space or enter after each one</span>
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
                placeholder="#hidden-gem #peaceful #solo-friendly"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => tagInput.trim() && addTag(tagInput)}
              />
            </div>
            <div className="tag-hint">
              💡 Your tags help shape your recommendations — the more you add, the smarter your feed gets.
            </div>
          </div>

          {/* image url */}
          <div className="pref-group">
            <div className="pref-group-label">Add a photo (optional)</div>
            <input
              className="review-url-input"
              type="url"
              placeholder="Paste an image URL from your photos…"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            {imageUrl && (
              <div className="image-preview-wrap">
                <img
                  src={imageUrl}
                  alt="preview"
                  className="image-preview"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Skip for now
            </button>
            <button
              type="submit"
              className="auth-submit"
              style={{ flex: 1 }}
              disabled={saving}
            >
              {saving ? "Saving…" : "Log this visit ✓"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}