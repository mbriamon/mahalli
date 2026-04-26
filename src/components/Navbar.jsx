// Navbar.jsx
// Top navigation bar with tabs and floating add spot button

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AddSpotModal from "./AddSpotModal";
import Toast from "./Toast";

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const path      = location.pathname;
  const [showAdd, setShowAdd] = useState(false);
  const [toast,   setToast]   = useState(null);

  return (
    <>
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

      {/* floating add button */}
      <button
        className="fab"
        onClick={() => setShowAdd(true)}
        title="Add a new spot"
      >
        +
      </button>

      {/* add spot modal */}
      {showAdd && (
        <AddSpotModal
          onClose={() => setShowAdd(false)}
          onAdded={() => {
            setShowAdd(false);
            setToast("Your spot is live! 🎉 It's now on the map and in the feed.");
          }}
        />
      )}

      {/* toast */}
      {toast && (
        <Toast message={toast} onDone={() => setToast(null)} />
      )}
    </>
  );
}