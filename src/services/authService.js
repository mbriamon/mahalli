import Parse from "parse";

// registerUser: creates a new Parse user account with the given username and password
// Returns the new user object on success, throws an error on failure
export async function registerUser(username, password) {
  const user = new Parse.User();
  // set the required fields for a new Parse user
  user.set("username", username);
  user.set("password", password);

  // signUp saves the user to Back4App and starts a session
  return await user.signUp();
}

// loginUser: logs in an existing Parse user with username and password
// Returns the logged-in user object on success, throws an error on failure
export async function loginUser(username, password) {
  return await Parse.User.logIn(username, password);
}

// logoutUser: ends the current user's Parse session
// Should be called when the user clicks logout
export async function logoutUser() {
  return await Parse.User.logOut();
}

// getCurrentUser: returns the currently logged-in Parse user, or null if not logged in
// Used to check auth state across the app
export function getCurrentUser() {
  return Parse.User.current();
}