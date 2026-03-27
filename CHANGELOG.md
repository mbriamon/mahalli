# Changelog

## [0.3.0] - 3/27/2026

## [0.3.0] - 3/27/2026

### Added (Student A - Mary)
- ProtectedRoute component to guard routes requiring authentication
- Updated App.jsx routing to wrap Home and SpotDetail with ProtectedRoute
- Auth route placeholder at /auth for Student B's login/register components
- Auth page styling in App.css
- Logout button on Home page that ends session and redirects to /auth

### Added (Student B - Layann)
- authService.js with login, register, logout, and getCurrentUser methods
- Auth page component with login and register forms
- Redirect to home if already logged in on the auth page
- Updated App.jsx to use Auth component on /auth route

## [0.2.0] - 3/5/2026

### Added
- Parse initialization with Back4App credentials
- TouristSpot Parse Model with CRUD operations
- Category Parse Model with CRUD operations
- Component tree diagram
- Routing with react-router-dom
- Home page with spot list and search/filter
- SpotDetail page for individual spot view
- SpotCard, SpotList, and SearchBar components

## [0.1.0] - 3/5/2026

### Added
- Initial project setup
- Tourist spots JSON data
- Custom axios service
- SpotCard and SpotList components
- SearchBar component with filtering