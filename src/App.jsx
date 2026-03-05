// App.jsx
// Main app component - initializes Parse and sets up routing
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Parse from "parse";
import Env from "./environments";
import Home from "./pages/Home";
import SpotDetail from "./pages/SpotDetail";

// Initialize Parse with Back4App credentials
Parse.initialize(Env.APPLICATION_ID, Env.JAVASCRIPT_KEY);
Parse.serverURL = Env.SERVER_URL;

function App() {
  return (
    // BrowserRouter wraps all routes and enables navigation
    <BrowserRouter>
      <Routes>
        {/* Home route - shows the spot list and search */}
        <Route path="/" element={<Home />} />
        {/* SpotDetail route - shows a single spot by id */}
        <Route path="/spot/:id" element={<SpotDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;