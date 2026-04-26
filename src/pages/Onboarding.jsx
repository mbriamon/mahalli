// Onboarding.jsx
// Shown to new users immediately after registration
// Forces them to set preferences before entering the app

import React from "react";
import { useNavigate } from "react-router-dom";
import PreferenceForm from "../components/PreferenceForm";

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="onboarding-wrap">
      <div className="onboarding-left">
        <div className="auth-left-logo">mahalli.</div>
        <div>
          <div className="auth-tagline">
            "Tell us what you love — we'll find it."
          </div>
          <div className="auth-sub">
            Your picks help us curate a personalised feed of spots just for you.
            You can always change these later from your account page.
          </div>
        </div>
      </div>

      <div className="onboarding-right">
        <div className="auth-title">What are you into?</div>
        <div className="auth-desc">
          Pick as many as you like — nothing is required.
        </div>
        <PreferenceForm onSaved={() => navigate("/")} />
        <button
          className="skip-btn"
          onClick={() => navigate("/")}
        >
          Skip for now →
        </button>
      </div>
    </div>
  );
}