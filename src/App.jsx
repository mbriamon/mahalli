// App.jsx
// Main app component - initializes Parse and sets up routing
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Parse from "parse";
import Env from "./environments";
import Home from "./pages/Home";
import SpotDetail from "./pages/SpotDetail";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";

// Initialize Parse with Back4App credentials
Parse.initialize(Env.APPLICATION_ID, Env.JAVASCRIPT_KEY);
Parse.serverURL = Env.SERVER_URL;

function App() {
  return (
    // BrowserRouter wraps all routes and enables navigation
    <BrowserRouter>
      <Routes>
        {/* Protected routes — require the user to be logged in */}
        {/* ProtectedRoute redirects to /auth if no session is found */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/spot/:id"
          element={
            <ProtectedRoute>
              <SpotDetail />
            </ProtectedRoute>
          }
        />

        {/* Auth route — login/signup page, accessible without authentication */}
        <Route path="/auth" element={<Auth />} />


        {/* Catch-all: redirect unknown paths back to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;