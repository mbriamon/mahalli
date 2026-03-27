// ProtectedRoute.jsx
// Student A - Mary Briamonte
// Feature 5: Authentication
// Wraps protected routes — redirects unauthenticated users to /auth.
// Any route that requires login should be wrapped with this component.

import React from "react";
import { Navigate } from "react-router-dom";
import Parse from "parse";

// ProtectedRoute checks if a user is currently logged in via Parse.
// If no session exists, the user is redirected to /auth.
// If authenticated, the child component is rendered normally.
function ProtectedRoute({ children }) {
  // Parse.User.current() returns the logged-in user object, or null if not logged in
  const currentUser = Parse.User.current();

  // Redirect unauthenticated users to the auth page
  // 'replace' prevents the protected route from appearing in browser history
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  // User is authenticated — render the protected page
  return children;
}

export default ProtectedRoute;