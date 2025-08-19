const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/server');
const User = require('../../src/models/User');
const Event = require('../../src/models/Event');

let mongoServer;
let testUser;
let authToken;

describe('Event Flow Integration Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Event.deleteMany({});

    // Create test user
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.data.accessToken;
  });

  describe('Event Creation and Management', () => {
    it('should create a new event successfully', async () => {
      const eventData = {
        title: 'Test Event',
        description: 'A test event',
        category: 'tech',
        startDate: new Date(Date.now() + 86400000), // Tomorrow
        endDate: new Date(Date.now() + 86400000 + 7200000), // Tomorrow + 2 hours
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128],
          address: 'New York, NY'
        },
        capacity: 100,
        price: 0
      };

      const response = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Event');
      expect(response.body.data.host.toString()).toBe(testUser._id.toString());
    });

    it('should get nearby events based on location', async () => {
      // Create events at different locations
      await Event.create([
        {
          title: 'Nearby Event 1',
          description: 'Event close to user',
          category: 'music',
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 86400000 + 7200000),
          location: {
            type: 'Point',
            coordinates: [-74.006, 40.7128], // NYC
            address: 'New York, NY'
          },
          host: testUser._id,
          status: 'active'
        },
        {
          title: 'Far Event',
          description: 'Event far from user',
          category: 'tech',
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 86400000 + 7200000),
          location: {
            type: 'Point',
            coordinates: [-118.2437, 34.0522], // LA
            address: 'Los Angeles, CA'
          },
          host: testUser._id,
          status: 'active'
        }
      ]);

      const response = await request(app)
        .get('/api/v1/events/nearby')
        .query({
          latitude: 40.7128,
          longitude: -74.006,
          radius: 50
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.events).toHaveLength(1);
      expect(response.body.data.events[0].title).toBe('Nearby Event 1');
    });

    it('should join and leave an event', async () => {
      const event = await Event.create({
        title: 'Joinable Event',
        description: 'An event to join',
        category: 'social',
        startDate: new Date(Date.now() + 86400000),
        endDate: new Date(Date.now() + 86400000 + 7200000),
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128],
          address: 'New York, NY'
        },
        host: testUser._id,
        status: 'active'
      });

      // Join event
      await request(app)
        .post(`/api/v1/events/${event._id}/join`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      let updatedEvent = await Event.findById(event._id);
      expect(updatedEvent.attendees).toContain(testUser._id);

      // Leave event
      await request(app)
        .post(`/api/v1/events/${event._id}/leave`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      updatedEvent = await Event.findById(event._id);
      expect(updatedEvent.attendees).not.toContain(testUser._id);
    });
  });

  describe('Event Search and Filtering', () => {
    it('should search events by title and category', async () => {
      await Event.create([
        {
          title: 'Tech Conference 2024',
          description: 'Annual tech conference',
          category: 'tech',
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 86400000 + 7200000),
          location: {
            type: 'Point',
            coordinates: [-74.006, 40.7128],
            address: 'New York, NY'
          },
          host: testUser._id,
          status: 'active'
        },
        {
          title: 'Music Festival',
          description: 'Summer music festival',
          category: 'music',
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 86400000 + 7200000),
          location: {
            type: 'Point',
            coordinates: [-74.006, 40.7128],
            address: 'New York, NY'
          },
          host: testUser._id,
          status: 'active'
        }
      ]);

      const response = await request(app)
        .get('/api/v1/search/events')
        .query({
          q: 'tech',
          category: 'tech'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.events).toHaveLength(1);
      expect(response.body.data.events[0].category).toBe('tech');
    });
  });
});