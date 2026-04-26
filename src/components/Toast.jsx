// Toast.jsx
// Small notification that pops up bottom-right after a visit is logged
// Message is personalised based on hashtags and rating from the review

import React, { useEffect, useState } from "react";

export default function Toast({ message, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // start fade out after 3 seconds
    const timer = setTimeout(() => setVisible(false), 3000);
    // remove from DOM after fade completes
    const cleanup = setTimeout(() => onDone(), 3600);
    return () => { clearTimeout(timer); clearTimeout(cleanup); };
  }, []);

  return (
    <div className={`toast${visible ? " toast-in" : " toast-out"}`}>
      <div className="toast-icon">🗺</div>
      <div className="toast-message">{message}</div>
    </div>
  );
}