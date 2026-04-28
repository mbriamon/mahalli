# Changelog

## [0.4.0] - 4/27/2026

### Added (Student A - Mary)
- Full Mahalli design system in index.css with CSS custom properties, Playfair Display and DM Sans typography, and Jordan-inspired colour palette
- For You page (Home.jsx) with preference-based spot scoring algorithm
- Spot of the day feature that rotates deterministically by date
- Mood filter chips on For You page for quick feed filtering
- Streak counter showing spots visited in the current month
- Account page with polaroid-style travel diary grouped by month on a timeline
- Passport stamp section on Account page showing cities visited
- Favourite hashtag badge and taste profile on Account page
- Review system with star ratings, comments, hashtags, and image URL
- Auto-updating user preferences based on visited spots and review hashtags
- Personalised toast notifications after logging a visit
- Add Spot modal with floating action button accessible from any page
- Wishlist feature with Save tab on Account page using new Wishlist Parse class
- mapService.js with getAllSpots, getSpotById, and getMappableSpots methods
- userService.js with visit recording, preference saving, and toast message generation
- reviewService.js with review submission, spot reviews fetch, and user hashtag aggregation
- wishlistService.js with add, remove, check, and fetch wishlist methods
- spotOfTheDay.js utility for deterministic daily spot selection
- Onboarding page with preference form shown to new users after registration
- PreferenceForm component reused across Onboarding and Account pages
- SpotCard component with category colour variants
- Toast component for bottom-right animated notifications
- Navbar component shared across all pages with active tab highlighting

### Added (Student B - Layann)
- Interactive map on Explore page using React-Leaflet and GeoJSON
- Three view modes on Explore page: grid, split, and full map
- Category-coloured map pins with custom Leaflet divIcon per spot category
- Spot popups on map with name, category, rating, and View Details button
- Sort dropdown on Explore page by top rated and newest added
- Near Me button that sorts spots by distance from a reference location
- Hashtag and review search so users can search by #tag across all reviews
- Wishlist toggle button on every spot card in Explore grid and split views
- Updated App.jsx routing to add /map and /explore routes
- Updated Back4App TouristSpot schema with Latitude and Longitude Number fields

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