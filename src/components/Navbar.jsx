// Navbar.jsx
// Top navigation bar with tabs for Home, Explore, and Account
// Shared across all main app pages

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const path      = location.pathname;

  return (
    <div className="topbar">
      <div className="logo">mahalli<span>.</span></div>
      <div className="nav-tabs">
        <button
          className={`nav-tab${path === "/" ? " active" : ""}`}
          onClick={() => navigate("/")}
        >
          ✦ For You
        </button>
        <button
          className={`nav-tab${path === "/explore" ? " active" : ""}`}
          onClick={() => navigate("/explore")}
        >
          🗺 Explore
        </button>
        <button
          className={`nav-tab${path === "/account" ? " active" : ""}`}
          onClick={() => navigate("/account")}
        >
          👤 Account
        </button>
      </div>
    </div>
  );
}