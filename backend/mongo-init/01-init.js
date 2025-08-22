// MongoDB initialization script for EventConnect
// This script runs when MongoDB container is first created

// Create application database
db = db.getSiblingDB('eventconnect');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'username', 'password', 'createdAt'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        username: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 30
        },
        password: {
          bsonType: 'string'
        },
        role: {
          enum: ['user', 'moderator', 'admin', 'super-admin']
        },
        isActive: {
          bsonType: 'bool'
        },
        createdAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

db.createCollection('events');
db.createCollection('tribes');
db.createCollection('posts');
db.createCollection('reviews');
db.createCollection('chats');
db.createCollection('notifications');
db.createCollection('inappnotifications');
db.createCollection('schedulednotifications');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });

db.events.createIndex({ title: 'text', description: 'text' });
db.events.createIndex({ location: '2dsphere' });
db.events.createIndex({ startDate: 1 });
db.events.createIndex({ category: 1 });
db.events.createIndex({ organizer: 1 });

db.tribes.createIndex({ name: 'text', description: 'text' });
db.tribes.createIndex({ category: 1 });
db.tribes.createIndex({ createdAt: -1 });

db.posts.createIndex({ content: 'text' });
db.posts.createIndex({ author: 1 });
db.posts.createIndex({ tribe: 1 });
db.posts.createIndex({ createdAt: -1 });

db.reviews.createIndex({ event: 1 });
db.reviews.createIndex({ user: 1 });
db.reviews.createIndex({ rating: 1 });

db.notifications.createIndex({ userId: 1, read: 1 });
db.notifications.createIndex({ createdAt: -1 });

// Create admin user (password should be changed on first login)
db.users.insertOne({
  email: 'admin@eventconnect.com',
  username: 'admin',
  password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiLXCJyJF2e.', // password: Admin123!
  role: 'admin',
  isActive: true,
  isEmailVerified: true,
  profile: {
    firstName: 'Admin',
    lastName: 'User',
    bio: 'EventConnect Administrator'
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

print('EventConnect database initialized successfully!');