# Mahalli UML Diagram FEATURE 6

Mahalli
│
├── User
│   ├── objectId : String
│   ├── username : String
│   ├── email : String
│   ├── emailVerified : Boolean
│   ├── prefCategories : Array
│   ├── prefSubcategories : Array
│   ├── prefPriceRange : Array
│   ├── prefCities : Array
│   ├── prefBestTime : Array
│   ├── prefBestSeason : Array
│   ├── prefAccessibility : Boolean
│   └── onboardingComplete : Boolean
│
├── TouristSpot
│   ├── objectId : String
│   ├── Spot_Number : Number
│   ├── City : String
│   ├── Name : String
│   ├── Category : String
│   ├── Subcategory : String
│   ├── Description : String
│   ├── Insider_Tip : String
│   ├── Price_Range : String
│   ├── Neighborhood : String
│   ├── Address : String
│   ├── Hours : String
│   ├── Best_Time : String
│   ├── Best_Season : String
│   ├── Accessibility : String
│   ├── Status : String
│   ├── Initial_Rating : Number
│   ├── Latitude : Number
│   ├── Longitude : Number
│   └── addedBy → User
│
├── Review
│   ├── objectId : String
│   ├── rating : Number
│   ├── comment : String
│   ├── hashtags : Array
│   ├── image : File
│   ├── imageUrl : String
│   ├── user → User
│   └── touristSpot → TouristSpot
│
├── Visit
│   ├── objectId : String
│   ├── visitedAt : Date
│   ├── reviewed : Boolean
│   ├── user → User
│   └── touristSpot → TouristSpot
│
└── Wishlist
    ├── objectId : String
    ├── user → User
    └── touristSpot → TouristSpot


