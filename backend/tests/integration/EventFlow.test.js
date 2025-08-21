const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = require('../../src/server');
const { User, Event, Post, Review } = require('../../src/models');

describe('Event Flow Integration Tests', () => {
  let hostUser;
  let attendeeUser;
  let testEvent;
  let hostToken;
  let attendeeToken;

  beforeAll(async () => {
    // La conexión a Mongo en tests la maneja tests/setup.js (MongoMemoryServer)
    // Aquí solo aseguramos que existe conexión
    if (mongoose.connection.readyState === 0) {
      throw new Error('MongoDB no conectado en entorno de prueba');
    }
  });

  afterAll(async () => {
    // Limpieza manejada por tests/setup.js
  });

  beforeEach(async () => {
    // Clear database before each test
    await User.deleteMany({});
    await Event.deleteMany({});
    await Post.deleteMany({});
    await Review.deleteMany({});

    // Create host user
    const hashedPassword = await bcrypt.hash('password123', 12);
    hostUser = new User({
      username: 'eventhost',
      email: 'host@example.com',
      password: hashedPassword,
      firstName: 'Event',
      lastName: 'Host',
      isVerified: true,
      rating: 4.5,
      interests: ['technology', 'business'],
      location: {
        type: 'Point',
        coordinates: [-74.006, 40.7128],
        address: 'New York, NY, USA',
        city: 'New York',
        state: 'NY',
        country: 'USA'
      }
    });
    await hostUser.save();

    // Create attendee user
    const attendeeHashedPassword = await bcrypt.hash('password123', 12);
    attendeeUser = new User({
      username: 'eventattendee',
      email: 'attendee@example.com',
      password: attendeeHashedPassword,
      firstName: 'Event',
      lastName: 'Attendee',
      isVerified: true,
      rating: 4.2,
      interests: ['technology', 'networking'],
      location: {
        type: 'Point',
        coordinates: [-74.006, 40.7128],
        address: 'New York, NY, USA',
        city: 'New York',
        state: 'NY',
        country: 'USA'
      }
    });
    await attendeeUser.save();

    // Login host user
    const hostLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'host@example.com',
        password: 'password123'
      });
    hostToken = hostLoginResponse.body.data.tokens.accessToken;

    // Login attendee user
    const attendeeLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'attendee@example.com',
        password: 'password123'
      });
    attendeeToken = attendeeLoginResponse.body.data.tokens.accessToken;
  });

  describe('Complete Event Lifecycle', () => {
    it('should handle complete event flow: create, join, post, review', async () => {
      // 1. Create Event
      const eventData = {
        title: 'Tech Meetup 2024',
        description: 'A great tech networking event',
        category: 'technology',
        subcategory: 'networking',
        tags: ['tech', 'networking', 'startup'],
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128],
          address: '123 Tech Street, New York, NY 10001',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          venue: 'Tech Hub NYC'
        },
        capacity: 100,
        pricing: {
          type: 'free',
          price: 0,
          currency: 'USD'
        },
        isPrivate: false
      };

      const createEventResponse = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${hostToken}`)
        .send(eventData)
        .expect(201);

      expect(createEventResponse.body.success).toBe(true);
      testEvent = createEventResponse.body.data.event;
      expect(testEvent.title).toBe(eventData.title);
      expect(testEvent.host).toBe(hostUser._id.toString());

      // 2. Attendee joins event
      const joinEventResponse = await request(app)
        .post(`/api/events/${testEvent._id}/join`)
        .set('Authorization', `Bearer ${attendeeToken}`)
        .expect(200);

      expect(joinEventResponse.body.success).toBe(true);
      expect(joinEventResponse.body.message).toContain('joined successfully');

      // Verify event attendee count increased
      const updatedEvent = await Event.findById(testEvent._id);
      expect(updatedEvent.attendees).toContain(attendeeUser._id);
      expect(updatedEvent.attendeeCount).toBe(1);

      // 3. Attendee creates a post about the event
      const postData = {
        content: 'Excited to attend this tech meetup! Looking forward to networking with fellow developers.',
        type: 'text',
        tags: ['excited', 'networking', 'tech'],
        event: testEvent._id
      };

      const createPostResponse = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${attendeeToken}`)
        .send(postData)
        .expect(201);

      expect(createPostResponse.body.success).toBe(true);
      const post = createPostResponse.body.data.post;
      expect(post.content).toBe(postData.content);
      expect(post.event).toBe(testEvent._id.toString());

      // 4. Attendee likes the event
      const likeEventResponse = await request(app)
        .post(`/api/events/${testEvent._id}/like`)
        .set('Authorization', `Bearer ${attendeeToken}`)
        .expect(200);

      expect(likeEventResponse.body.success).toBe(true);
      expect(likeEventResponse.body.message).toContain('liked successfully');

      // Verify event like count increased
      const likedEvent = await Event.findById(testEvent._id);
      expect(likedEvent.likes).toContain(attendeeUser._id);
      expect(likedEvent.likeCount).toBe(1);

      // 5. Attendee creates a review for the host after event
      // Simulate event completion by updating event status
      await Event.findByIdAndUpdate(testEvent._id, { status: 'completed' });

      const reviewData = {
        event: testEvent._id,
        host: hostUser._id,
        rating: 5,
        comment: 'Amazing event! The host was very organized and the networking opportunities were great.',
        categories: [
          { name: 'organization', score: 5 },
          { name: 'content', score: 5 },
          { name: 'networking', score: 5 }
        ],
        tags: ['organized', 'valuable', 'recommended']
      };

      const createReviewResponse = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${attendeeToken}`)
        .send(reviewData)
        .expect(201);

      expect(createReviewResponse.body.success).toBe(true);
      const review = createReviewResponse.body.data.review;
      expect(review.rating).toBe(reviewData.rating);
      expect(review.comment).toBe(reviewData.comment);
      expect(review.reviewer).toBe(attendeeUser._id.toString());

      // 6. Verify host rating was updated
      const updatedHost = await User.findById(hostUser._id);
      expect(updatedHost.rating).toBeGreaterThan(hostUser.rating);

      // 7. Get event analytics (host only)
      const analyticsResponse = await request(app)
        .get(`/api/events/${testEvent._id}/stats`)
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);

      expect(analyticsResponse.body.success).toBe(true);
      const analytics = analyticsResponse.body.data.analytics;
      expect(analytics.totalAttendees).toBe(1);
      expect(analytics.engagement.posts).toBe(1);
      expect(analytics.engagement.likes).toBe(1);
    });

    it('should handle event search and discovery', async () => {
      // Create multiple events
      const eventsData = [
        {
          title: 'Tech Conference 2024',
          description: 'Annual technology conference',
          category: 'technology',
          subcategory: 'conference',
          tags: ['tech', 'conference', 'innovation'],
          startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
          location: {
            type: 'Point',
            coordinates: [-74.006, 40.7128],
            address: '456 Tech Ave, New York, NY 10002',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            venue: 'Tech Center'
          },
          capacity: 200,
          pricing: { type: 'paid', price: 50, currency: 'USD' },
          isPrivate: false
        },
        {
          title: 'Art Workshop',
          description: 'Creative art workshop',
          category: 'art',
          subcategory: 'workshop',
          tags: ['art', 'creative', 'workshop'],
          startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
          location: {
            type: 'Point',
            coordinates: [-74.006, 40.7128],
            address: '789 Art St, New York, NY 10003',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            venue: 'Art Studio'
          },
          capacity: 30,
          pricing: { type: 'free', price: 0, currency: 'USD' },
          isPrivate: false
        }
      ];

      // Create events
      for (const eventData of eventsData) {
        await request(app)
          .post('/api/events')
          .set('Authorization', `Bearer ${hostToken}`)
          .send(eventData)
          .expect(201);
      }

      // Search for technology events
      const searchResponse = await request(app)
        .get('/api/events/search?q=tech&category=technology')
        .expect(200);

      expect(searchResponse.body.success).toBe(true);
      expect(searchResponse.body.data.events.length).toBeGreaterThan(0);
      expect(searchResponse.body.data.events[0].category).toBe('technology');

      // Get nearby events
      const nearbyResponse = await request(app)
        .get('/api/events/nearby?lat=40.7128&lng=-74.006&radius=50')
        .expect(200);

      expect(nearbyResponse.body.success).toBe(true);
      expect(nearbyResponse.body.data.events.length).toBeGreaterThan(0);

      // Get trending events
      const trendingResponse = await request(app)
        .get('/api/events/trending')
        .expect(200);

      expect(trendingResponse.body.success).toBe(true);
      expect(trendingResponse.body.data.events).toBeDefined();
    });

    it('should handle event updates and cancellations', async () => {
      // Create event
      const eventData = {
        title: 'Updateable Event',
        description: 'This event will be updated and then cancelled',
        category: 'business',
        subcategory: 'meetup',
        tags: ['business', 'meetup'],
        startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128],
          address: '123 Business St, New York, NY 10001',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          venue: 'Business Center'
        },
        capacity: 50,
        pricing: { type: 'free', price: 0, currency: 'USD' },
        isPrivate: false
      };

      const createEventResponse = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${hostToken}`)
        .send(eventData)
        .expect(201);

      const eventId = createEventResponse.body.data.event._id;

      // Update event
      const updateData = {
        title: 'Updated Event Title',
        description: 'This event has been updated',
        capacity: 75
      };

      const updateResponse = await request(app)
        .put(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.event.title).toBe(updateData.title);
      expect(updateResponse.body.data.event.description).toBe(updateData.description);
      expect(updateResponse.body.data.event.capacity).toBe(updateData.capacity);

      // Verify database was updated
      const updatedEvent = await Event.findById(eventId);
      expect(updatedEvent.title).toBe(updateData.title);
      expect(updatedEvent.description).toBe(updateData.description);
      expect(updatedEvent.capacity).toBe(updateData.capacity);

      // Cancel event
      const cancelData = {
        reason: 'Unforeseen circumstances'
      };

      const cancelResponse = await request(app)
        .put(`/api/events/${eventId}/cancel`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send(cancelData)
        .expect(200);

      expect(cancelResponse.body.success).toBe(true);
      expect(cancelResponse.body.message).toContain('cancelled successfully');

      // Verify event status was updated
      const cancelledEvent = await Event.findById(eventId);
      expect(cancelledEvent.status).toBe('cancelled');
      expect(cancelledEvent.cancellationReason).toBe(cancelData.reason);
    });

    it('should handle user interactions and social features', async () => {
      // Create event
      const eventData = {
        title: 'Social Event',
        description: 'An event to test social features',
        category: 'community',
        subcategory: 'meetup',
        tags: ['community', 'social', 'fun'],
        startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128],
          address: '123 Social St, New York, NY 10001',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          venue: 'Community Center'
        },
        capacity: 40,
        pricing: { type: 'free', price: 0, currency: 'USD' },
        isPrivate: false
      };

      const createEventResponse = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${hostToken}`)
        .send(eventData)
        .expect(201);

      const eventId = createEventResponse.body.data.event._id;

      // Attendee joins event
      await request(app)
        .post(`/api/events/${eventId}/join`)
        .set('Authorization', `Bearer ${attendeeToken}`)
        .expect(200);

      // Attendee likes event
      await request(app)
        .post(`/api/events/${eventId}/like`)
        .set('Authorization', `Bearer ${attendeeToken}`)
        .expect(200);

      // Attendee creates post about event
      const postData = {
        content: 'Can\'t wait for this event! Anyone else excited?',
        type: 'text',
        tags: ['excited', 'community'],
        event: eventId
      };

      const postResponse = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${attendeeToken}`)
        .send(postData)
        .expect(201);

      const postId = postResponse.body.data.post._id;

      // Host likes the post
      const likePostResponse = await request(app)
        .post(`/api/posts/${postId}/like`)
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);

      expect(likePostResponse.body.success).toBe(true);

      // Host comments on the post
      const commentData = {
        content: 'We\'re excited to have you! It\'s going to be a great event.'
      };

      const commentResponse = await request(app)
        .post(`/api/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send(commentData)
        .expect(201);

      expect(commentResponse.body.success).toBe(true);
      expect(commentResponse.body.data.comment.content).toBe(commentData.content);

      // Get event posts
      const eventPostsResponse = await request(app)
        .get(`/api/posts/event/${eventId}`)
        .expect(200);

      expect(eventPostsResponse.body.success).toBe(true);
      expect(eventPostsResponse.body.data.posts.length).toBe(1);
      expect(eventPostsResponse.body.data.posts[0].event).toBe(eventId.toString());

      // Get user's events
      const userEventsResponse = await request(app)
        .get('/api/events/user/events')
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(200);

      expect(userEventsResponse.body.success).toBe(true);
      expect(userEventsResponse.body.data.events.length).toBe(1);
      expect(userEventsResponse.body.data.events[0].host).toBe(hostUser._id.toString());
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle unauthorized access attempts', async () => {
      // Create event
      const eventData = {
        title: 'Private Event',
        description: 'This event will test authorization',
        category: 'business',
        subcategory: 'meeting',
        tags: ['business', 'private'],
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128],
          address: '123 Private St, New York, NY 10001',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          venue: 'Private Office'
        },
        capacity: 20,
        pricing: { type: 'free', price: 0, currency: 'USD' },
        isPrivate: false
      };

      const createEventResponse = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${hostToken}`)
        .send(eventData)
        .expect(201);

      const eventId = createEventResponse.body.data.event._id;

      // Try to update event without authorization
      const updateData = { title: 'Unauthorized Update' };
      await request(app)
        .put(`/api/events/${eventId}`)
        .send(updateData)
        .expect(401);

      // Try to delete event without authorization
      await request(app)
        .delete(`/api/events/${eventId}`)
        .expect(401);

      // Try to access with invalid token
      await request(app)
        .put(`/api/events/${eventId}`)
        .set('Authorization', 'Bearer invalid-token')
        .send(updateData)
        .expect(401);
    });

    it('should handle validation errors gracefully', async () => {
      // Try to create event with invalid data
      const invalidEventData = {
        title: '', // Empty title
        description: 'A', // Too short description
        category: 'invalid-category',
        startDate: 'invalid-date',
        capacity: -5 // Negative capacity
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${hostToken}`)
        .send(invalidEventData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should handle resource not found errors', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      // Try to get non-existent event
      await request(app)
        .get(`/api/events/${nonExistentId}`)
        .expect(404);

      // Try to update non-existent event
      await request(app)
        .put(`/api/events/${nonExistentId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ title: 'Update' })
        .expect(404);

      // Try to delete non-existent event
      await request(app)
        .delete(`/api/events/${nonExistentId}`)
        .set('Authorization', `Bearer ${hostToken}`)
        .expect(404);
    });
  });
});