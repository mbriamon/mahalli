import React, { useState } from "react";
import "../App.css";
import { useNavigate, Navigate } from "react-router-dom";
import { loginUser, registerUser, getCurrentUser } from "../services/authService";

function Auth() {
  // if user is already logged in, redirect them away from the auth page
  if (getCurrentUser()) {
    return <Navigate to="/" replace />;
  }

  // toggle between login and register modes
  const [isLogin, setIsLogin] = useState(true);

  // form field state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // error message state for displaying feedback to the user
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // handleSubmit: called when the form is submitted
  // runs either login or register depending on current mode
  async function handleSubmit(e) {
    e.preventDefault();
    // clear any previous error before attempting
    setError("");

    try {
      if (isLogin) {
        // attempt to log in with the provided credentials
        await loginUser(username, password);
      } else {
        // attempt to register a new account
        await registerUser(username, password);
      }
      // on success, navigate to the home page
      navigate("/");
    } catch (err) {
      // display the error message from Parse to the user
      setError(err.message);
    }
  }

  return (
    <div className="auth-container">
      <h1>Mahalee 🇯🇴</h1>

      {/* toggle heading based on current mode */}
      <h2>{isLogin ? "Login" : "Register"}</h2>

      {/* show error message if one exists */}
      {error && <p className="auth-error">{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* username input field */}
        <div>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* password input field */}
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* submit button label changes based on mode */}
        <button type="submit">{isLogin ? "Login" : "Register"}</button>
      </form>

      {/* toggle between login and register modes */}
      <p>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Register" : "Login"}
        </button>
      </p>
    </div>
  );
}

export default Auth;