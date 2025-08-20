# EventConnect API Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | User registration | No |
| POST | `/auth/login` | User login | No |
| POST | `/auth/refresh-token` | Refresh access token | No |
| POST | `/auth/logout` | User logout | Yes |
| GET | `/auth/profile` | Get user profile | Yes |
| PUT | `/auth/profile` | Update user profile | Yes |
| PUT | `/auth/change-password` | Change password | Yes |

### Events
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/events` | Get all events | Optional |
| GET | `/events/trending` | Get trending events | Optional |
| GET | `/events/nearby` | Get nearby events | Optional |
| GET | `/events/search` | Search events | Optional |
| GET | `/events/:id` | Get event by ID | Optional |
| POST | `/events` | Create event | Yes |
| PUT | `/events/:id` | Update event | Yes (Owner/Admin) |
| DELETE | `/events/:id` | Delete event | Yes (Owner/Admin) |
| POST | `/events/:id/join` | Join event | Yes |
| DELETE | `/events/:id/leave` | Leave event | Yes |
| POST | `/events/:id/like` | Toggle event like | Yes |

### Tribes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tribes` | Get all tribes | Optional |
| GET | `/tribes/trending` | Get trending tribes | Optional |
| GET | `/tribes/nearby` | Get nearby tribes | Optional |
| GET | `/tribes/search` | Search tribes | Optional |
| GET | `/tribes/:id` | Get tribe by ID | Optional |
| POST | `/tribes` | Create tribe | Yes |
| PUT | `/tribes/:id` | Update tribe | Yes (Owner/Admin) |
| DELETE | `/tribes/:id` | Delete tribe | Yes (Owner/Admin) |
| POST | `/tribes/:id/join` | Join tribe | Yes |
| DELETE | `/tribes/:id/leave` | Leave tribe | Yes |

### Posts
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/posts` | Get all posts | Optional |
| GET | `/posts/trending` | Get trending posts | Optional |
| GET | `/posts/search` | Search posts | Optional |
| GET | `/posts/:id` | Get post by ID | Optional |
| POST | `/posts` | Create post | Yes |
| PUT | `/posts/:id` | Update post | Yes (Owner/Admin) |
| DELETE | `/posts/:id` | Delete post | Yes (Owner/Admin) |
| POST | `/posts/:id/like` | Toggle post like | Yes |
| POST | `/posts/:id/save` | Toggle post save | Yes |

### Reviews
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/reviews` | Get all reviews | Optional |
| GET | `/reviews/search` | Search reviews | Optional |
| GET | `/reviews/:id` | Get review by ID | Optional |
| GET | `/reviews/host/:hostId` | Get host reviews | Optional |
| GET | `/reviews/event/:eventId` | Get event reviews | Optional |
| POST | `/reviews` | Create review | Yes |
| PUT | `/reviews/:id` | Update review | Yes (Owner/Admin) |
| DELETE | `/reviews/:id` | Delete review | Yes (Owner/Admin) |

### Chat
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/chat` | Create chat | Yes |
| GET | `/chat` | Get user chats | Yes |
| GET | `/chat/:id` | Get chat by ID | Yes |
| DELETE | `/chat/:id` | Delete chat | Yes (Owner/Admin) |
| GET | `/chat/:id/messages` | Get chat messages | Yes |
| POST | `/chat/:id/messages` | Send message | Yes |
| PUT | `/chat/:id/messages/:messageId` | Update message | Yes (Owner/Admin) |
| DELETE | `/chat/:id/messages/:messageId` | Delete message | Yes (Owner/Admin) |

### Notifications
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/notifications` | Get user notifications | Yes |
| GET | `/notifications/:id` | Get notification by ID | Yes |
| PUT | `/notifications/:id/read` | Mark as read | Yes |
| PUT | `/notifications/read-all` | Mark all as read | Yes |
| DELETE | `/notifications/:id` | Delete notification | Yes |
| GET | `/notifications/preferences` | Get preferences | Yes |
| PUT | `/notifications/preferences` | Update preferences | Yes |

### Search
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/search/suggestions` | Get search suggestions | Optional |
| GET | `/search/trending` | Get trending searches | Optional |
| POST | `/search/global` | Global search | Yes |
| GET | `/search/analytics` | Search analytics | Yes |

## Request/Response Examples

### User Registration
```json
POST /auth/register
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}

Response: 201
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "username": "johndoe",
      "email": "john@example.com"
    },
    "tokens": {
      "accessToken": "access_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

### Create Event
```json
POST /events
Authorization: Bearer <access_token>
{
  "title": "Tech Meetup 2024",
  "description": "Join us for an evening of tech talks",
  "category": "technology",
  "location": {
    "type": "Point",
    "coordinates": [-74.006, 40.7128],
    "address": "123 Tech Street, NYC"
  },
  "startDate": "2024-03-15T18:00:00Z",
  "endDate": "2024-03-15T21:00:00Z",
  "capacity": 100,
  "isFree": true,
  "tags": ["tech", "networking", "learning"]
}

Response: 201
{
  "success": true,
  "data": {
    "event": {
      "id": "event_id",
      "title": "Tech Meetup 2024",
      "host": "user_id",
      "status": "upcoming"
    }
  }
}
```

### Get Events with Filters
```json
GET /events?category=technology&location[lat]=40.7128&location[lng]=-74.006&location[radius]=50&page=1&limit=20

Response: 200
{
  "success": true,
  "data": {
    "events": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

## Error Responses

### Validation Error
```json
Response: 400
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Authentication Error
```json
Response: 401
{
  "success": false,
  "error": {
    "message": "Access token expired",
    "code": "TOKEN_EXPIRED"
  }
}
```

### Not Found Error
```json
Response: 404
{
  "success": false,
  "error": {
    "message": "Event not found",
    "code": "RESOURCE_NOT_FOUND"
  }
}
```

## Rate Limiting
- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **File Upload**: 10 requests per hour
- **Search**: 50 requests per 15 minutes

## WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'access_token' }
});
```

### Event Updates
```javascript
socket.on('event_updated', (data) => {
  console.log('Event updated:', data);
});

socket.on('event_joined', (data) => {
  console.log('User joined event:', data);
});
```

### Chat Messages
```javascript
socket.on('message_received', (data) => {
  console.log('New message:', data);
});

socket.emit('send_message', {
  chatId: 'chat_id',
  content: 'Hello world!',
  type: 'text'
});
```

## File Upload

### Supported Formats
- **Images**: JPG, PNG, GIF, WebP (max 10MB)
- **Videos**: MP4, MOV, AVI (max 50MB)
- **Documents**: PDF, DOC, TXT (max 5MB)

### Upload Example
```javascript
const formData = new FormData();
formData.append('images', file);

fetch('/api/events/event_id/images', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

## Pagination
All list endpoints support pagination:
```
?page=1&limit=20&sort=createdAt&order=desc
```

## Filtering
Most endpoints support filtering:
```
?category=technology&status=upcoming&date[gte]=2024-01-01
```

## Response Format
All API responses follow this structure:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error