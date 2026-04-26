// App.jsx
// Main app component - initializes Parse and sets up routing
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Parse from "parse";
import Env from "./environments";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Account from "./pages/Account";
import SpotDetail from "./pages/SpotDetail";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import Onboarding from "./pages/Onboarding";

// Initialize Parse with Back4App credentials
Parse.initialize(Env.APPLICATION_ID, Env.JAVASCRIPT_KEY);
Parse.serverURL = Env.SERVER_URL;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/auth" element={<Auth />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <Explore />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
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

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;