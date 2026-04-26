// PreferenceForm.jsx
// Reusable preference form used on both onboarding and account page
// Lets users select their travel preferences which drive recommendations

import React, { useState } from "react";
import { savePreferences } from "../services/userService";

const CATEGORIES    = ["food", "cafe", "historic", "nature", "culture"];
const SUBCATEGORIES = ["restaurant", "bookshop-cafe", "archaeological", "canyon", "snorkelling", "hot-springs", "hammam", "museum", "market", "hiking", "roman", "waterfront-cafe", "art-cafe", "specialty-coffee"];
const PRICE_RANGES  = ["free", "budget", "moderate", "upscale"];
const CITIES        = ["Amman", "Petra", "Aqaba", "Jerash", "Wadi Rum", "Dead Sea", "Madaba"];
const BEST_TIMES    = ["early morning", "morning", "afternoon", "evening", "sunset", "any time"];
const BEST_SEASONS  = ["spring", "summer", "autumn", "winter", "year-round"];

// generic multi-select chip group
function ChipGroup({ label, options, selected, onChange }) {
  function toggle(val) {
    onChange(
      selected.includes(val)
        ? selected.filter((v) => v !== val)
        : [...selected, val]
    );
  }
  return (
    <div className="pref-group">
      <div className="pref-group-label">{label}</div>
      <div className="pref-chips">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`pref-chip${selected.includes(opt) ? " active" : ""}`}
            onClick={() => toggle(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PreferenceForm({ initial = {}, onSaved }) {
  const [categories,    setCategories]    = useState(initial.categories    || []);
  const [subcategories, setSubcategories] = useState(initial.subcategories || []);
  const [priceRange,    setPriceRange]    = useState(initial.priceRange    || []);
  const [cities,        setCities]        = useState(initial.cities        || []);
  const [bestTime,      setBestTime]      = useState(initial.bestTime      || []);
  const [bestSeason,    setBestSeason]    = useState(initial.bestSeason    || []);
  const [accessibility, setAccessibility] = useState(initial.accessibility || false);
  const [saving,        setSaving]        = useState(false);
  const [saved,         setSaved]         = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await savePreferences({
        categories,
        subcategories,
        priceRange,
        cities,
        bestTime,
        bestSeason,
        accessibility,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (onSaved) onSaved();
    } catch (err) {
      console.error("Failed to save preferences:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="pref-form" onSubmit={handleSubmit}>
      <ChipGroup
        label="Categories you love"
        options={CATEGORIES}
        selected={categories}
        onChange={setCategories}
      />
      <ChipGroup
        label="Types of places"
        options={SUBCATEGORIES}
        selected={subcategories}
        onChange={setSubcategories}
      />
      <ChipGroup
        label="Budget"
        options={PRICE_RANGES}
        selected={priceRange}
        onChange={setPriceRange}
      />
      <ChipGroup
        label="Cities you want to explore"
        options={CITIES}
        selected={cities}
        onChange={setCities}
      />
      <ChipGroup
        label="Best time of day"
        options={BEST_TIMES}
        selected={bestTime}
        onChange={setBestTime}
      />
      <ChipGroup
        label="Best season"
        options={BEST_SEASONS}
        selected={bestSeason}
        onChange={setBestSeason}
      />

      {/* accessibility toggle */}
      <div className="pref-group">
        <div className="pref-group-label">Accessibility</div>
        <label className="pref-toggle">
          <input
            type="checkbox"
            checked={accessibility}
            onChange={(e) => setAccessibility(e.target.checked)}
          />
          <span>Only show fully accessible spots</span>
        </label>
      </div>

      <button
        type="submit"
        className="auth-submit"
        disabled={saving}
        style={{ marginTop: 8 }}
      >
        {saving ? "Saving…" : saved ? "✓ Saved!" : "Save preferences"}
      </button>
    </form>
  );
}