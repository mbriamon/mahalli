# Mahalee UML Diagram

## TouristSpot
| Attribute   | Data Type |
|-------------|-----------|
| objectId    | String    |
| createdAt   | Date      |
| updatedAt   | Date      |
| name        | String    |
| category    | String    |
| city        | String    |
| description | String    |
| rating      | Number    |
| openHours   | String    |

## Category
| Attribute   | Data Type              |
|-------------|------------------------|
| objectId    | String                 |
| createdAt   | Date                   |
| updatedAt   | Date                   |
| name        | String                 |
| spots       | Array <TouristSpot>    |

## Relationships
- Category has a 1-to-many relationship with TouristSpot
- spots is stored as an Array because each category has fewer than 10 spots (Rule of 10)