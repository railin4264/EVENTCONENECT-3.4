# EventConnect Backend

A robust, scalable backend API for the EventConnect platform - a comprehensive event and tribe discovery platform with social networking features.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with refresh tokens
- **Event Management**: Create, manage, and discover events with advanced filtering
- **Tribe Management**: Build and manage communities around shared interests
- **Social Features**: Posts, comments, likes, and social interactions
- **Real-time Communication**: WebSocket-based chat and notifications
- **Search & Discovery**: Intelligent search across all entities with relevance scoring
- **File Management**: Cloudinary integration for image and media uploads
- **Geolocation**: Location-based event and tribe discovery
- **Review System**: Host rating and review system for events
- **Push Notifications**: Multi-channel notification system
- **Analytics**: Comprehensive analytics and insights for events and users

## 🏗️ Architecture

```
src/
├── config/          # Configuration files (database, Redis, JWT, etc.)
├── controllers/     # Business logic controllers
├── middleware/      # Custom middleware (auth, validation, etc.)
├── models/          # Mongoose data models
├── routes/          # API route definitions
├── services/        # Reusable business logic services
├── scripts/         # Database scripts (seeders, migrations)
├── tests/           # Test files (unit, integration)
├── utils/           # Utility functions
└── server.js        # Main application entry point
```

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis for session management and caching
- **Authentication**: JWT with refresh token rotation
- **Real-time**: Socket.IO for WebSocket communication
- **File Storage**: Cloudinary for media management
- **Validation**: Joi schema validation
- **Security**: Helmet, CORS, rate limiting, XSS protection
- **Testing**: Jest with supertest for API testing
- **Documentation**: OpenAPI/Swagger (planned)

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 5.0+
- Redis 6.0+
- npm or yarn

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/eventconnect/backend.git
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/eventconnect

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secrets
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### 4. Start Services

#### MongoDB
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or using local installation
mongod
```

#### Redis
```bash
# Using Docker
docker run -d -p 6379:6379 --name redis redis:latest

# Or using local installation
redis-server
```

### 5. Database Setup

```bash
# Run migrations
npm run db:migrate

# Seed with sample data
npm run db:seed

# Or reset database (clear + seed)
npm run db:reset
```

### 6. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Or directly with Node
node src/server.js
```

The server will start at `http://localhost:5000`

## 📚 API Documentation

Comprehensive API documentation is available at:
- [API Reference](./API.md)
- Interactive docs: `http://localhost:5000/api-docs` (planned)

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test files
npm test -- --testPathPattern=AuthController

# Run integration tests only
npm test -- --testPathPattern=integration
```

### Test Structure

```
tests/
├── setup.js                 # Global test setup
├── unit/                    # Unit tests
│   └── controllers/         # Controller tests
├── integration/             # Integration tests
└── fixtures/                # Test data fixtures
```

### Test Coverage

The project maintains a minimum test coverage of 70% across:
- Branches
- Functions  
- Lines
- Statements

## 🗄️ Database Management

### Available Commands

```bash
# Database operations
npm run db:migrate          # Run migrations
npm run db:rollback         # Rollback migrations
npm run db:seed             # Seed database
npm run db:clear            # Clear all data
npm run db:reset            # Reset database (clear + seed)
npm run db:status           # Show database status
npm run db:health           # Check database health
npm run db:backup           # Create backup
npm run db:restore <file>   # Restore from backup
```

### Database Scripts

```bash
# Direct script execution
node src/scripts/database.js migrate
node src/scripts/database.js seed
node src/scripts/database.js status
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | - |
| `REDIS_URL` | Redis connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_REFRESH_SECRET` | JWT refresh secret | - |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - |
| `CORS_ORIGIN` | Allowed CORS origin | - |

### Database Configuration

The application supports multiple database configurations:

- **Development**: Local MongoDB instance
- **Testing**: In-memory MongoDB (MongoMemoryServer)
- **Production**: MongoDB Atlas or production cluster

### Redis Configuration

Redis is used for:
- Session storage
- API response caching
- Rate limiting
- Real-time data caching

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t eventconnect-backend .

# Run container
docker run -p 5000:5000 eventconnect-backend
```

### Environment-Specific Configs

```bash
# Production environment
NODE_ENV=production npm start

# Staging environment  
NODE_ENV=staging npm start
```

## 📊 Monitoring & Logging

### Health Checks

```bash
# Application health
GET /health

# Database health
GET /health/db

# Redis health
GET /health/redis
```

### Logging

The application uses structured logging with different levels:
- **Development**: Console output with colors
- **Production**: JSON structured logs
- **File Rotation**: Automatic log rotation and compression

### Performance Monitoring

- Request/response time tracking
- Memory usage monitoring
- Database query performance
- API endpoint metrics

## 🔒 Security Features

- **Authentication**: JWT-based with refresh token rotation
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: Configurable rate limiting per endpoint
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers middleware
- **XSS Protection**: Cross-site scripting prevention
- **NoSQL Injection**: MongoDB injection prevention
- **File Upload Security**: File type and size validation

## 🔄 API Versioning

The API supports versioning through URL prefixes:

```
/api/v1/events
/api/v1/users
/api/v2/events  # Future version
```

## 📱 Real-time Features

### WebSocket Events

- **User Events**: Online status, location updates
- **Event Events**: Join/leave, updates, cancellations
- **Chat Events**: Real-time messaging
- **Notification Events**: Instant notifications

### Socket.IO Integration

```javascript
// Client connection
const socket = io('http://localhost:5000', {
  auth: { token: 'access_token' }
});

// Listen for events
socket.on('event_updated', (data) => {
  console.log('Event updated:', data);
});
```

## 🗂️ File Management

### Supported File Types

- **Images**: JPG, PNG, GIF, WebP
- **Videos**: MP4, MOV, AVI
- **Documents**: PDF, DOC, TXT

### File Upload Limits

- **Max File Size**: 10MB per file
- **Max Files**: 5 per upload
- **Storage**: Cloudinary cloud storage
- **CDN**: Automatic CDN distribution

## 🔍 Search & Discovery

### Search Features

- **Global Search**: Search across all entities
- **Fuzzy Search**: Typo-tolerant search
- **Location Search**: Geographic proximity search
- **Relevance Scoring**: Intelligent result ranking
- **Search Suggestions**: Real-time search hints
- **Trending Searches**: Popular search terms

### Search API

```javascript
// Global search
const results = await api.search.global({
  query: 'tech meetup',
  filters: {
    type: 'event',
    category: 'technology',
    location: { lat: 40.7128, lng: -74.006, radius: 50 }
  }
});
```

## 📈 Analytics & Insights

### Event Analytics

- Attendee demographics
- Engagement metrics
- Growth tracking
- Revenue analytics
- Retention rates

### User Analytics

- Activity patterns
- Event preferences
- Social interactions
- Search behavior

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Standards

- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Git hooks for code quality
- **Conventional Commits**: Standardized commit messages

### Testing Guidelines

- **Unit Tests**: Test individual functions and methods
- **Integration Tests**: Test API endpoints and workflows
- **Coverage**: Maintain minimum 70% test coverage
- **Mocking**: Use mocks for external dependencies

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: [https://docs.eventconnect.com](https://docs.eventconnect.com)
- **Issues**: [GitHub Issues](https://github.com/eventconnect/backend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/eventconnect/backend/discussions)
- **Email**: backend-support@eventconnect.com

### Community

- **Discord**: [https://discord.gg/eventconnect](https://discord.gg/eventconnect)
- **Twitter**: [@EventConnect](https://twitter.com/EventConnect)
- **Blog**: [https://blog.eventconnect.com](https://blog.eventconnect.com)

## 🙏 Acknowledgments

- **Express.js** team for the amazing web framework
- **MongoDB** team for the robust database
- **Socket.IO** team for real-time capabilities
- **Cloudinary** team for media management
- **Jest** team for the testing framework

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed history of changes.

---

**Built with ❤️ by the EventConnect Team**