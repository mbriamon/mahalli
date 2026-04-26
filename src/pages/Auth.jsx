// Auth.jsx
import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { loginUser, registerUser, getCurrentUser } from "../services/authService";

function Auth() {
  if (getCurrentUser()) {
    return <Navigate to="/" replace />;
  }

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await loginUser(username, password);
        navigate("/");
      } else {
        await registerUser(username, password);
        // new users go to onboarding to set preferences
        navigate("/onboarding");
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-left-logo">mahalli.</div>
        <div>
          <div className="auth-tagline">
            "See every city<br />through local eyes."
          </div>
          <div className="auth-sub">
            Verified locals worldwide add the real spots — the ones
            that never make it to any tourist map.
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-title">
          {isLogin ? "Welcome back" : "Create account"}
        </div>
        <div className="auth-desc">
          {isLogin
            ? "Sign in to your account to continue your journey."
            : "Join free — no credit card needed."}
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your username"
              required
            />
          </div>
          <div className="auth-form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="auth-submit">
            {isLogin ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? "No account? " : "Already have an account? "}
          <button onClick={() => { setIsLogin(!isLogin); setError(""); }}>
            {isLogin ? "Create one free" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;