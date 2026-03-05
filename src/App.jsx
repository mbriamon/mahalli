// App.jsx
// Main app component - initializes Parse and sets up routing
import React from "react";
import Parse from "parse";
import Env from "./environments";

// Initialize Parse with Back4App credentials
Parse.initialize(Env.APPLICATION_ID, Env.JAVASCRIPT_KEY);
Parse.serverURL = Env.SERVER_URL;

function App() {
  return (
    <div>
      <h1>Mahalli 🇯🇴</h1>
    </div>
  );
}

export default App;