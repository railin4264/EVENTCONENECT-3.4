const Event = require('../../models/Event');
const User = require('../../models/User');

class EventSeeder {
  async seed() {
    try {
      console.log('🌱 Seeding events...');
      
      // Get some users to assign as hosts
      const users = await User.find().limit(5);
      if (users.length === 0) {
        console.log('⚠️ No users found. Please seed users first.');
        return;
      }

      const events = [
        {
          title: 'Tech Meetup NYC',
          description: 'Join us for an evening of networking and tech talks in the heart of Manhattan. Learn about the latest trends in AI, blockchain, and web development.',
          category: 'tech',
          startDate: new Date(Date.now() + 86400000), // Tomorrow
          endDate: new Date(Date.now() + 86400000 + 7200000), // Tomorrow + 2 hours
          location: {
            type: 'Point',
            coordinates: [-74.006, 40.7128], // NYC
            address: '123 Tech Street, New York, NY 10001',
            city: 'New York',
            state: 'NY',
            country: 'USA'
          },
          capacity: 150,
          price: 0,
          tags: ['networking', 'ai', 'blockchain', 'webdev'],
          host: users[0]._id,
          status: 'active'
        },
        {
          title: 'Summer Music Festival',
          description: 'A day filled with live music, food trucks, and great vibes. Multiple stages featuring local and national artists.',
          category: 'music',
          startDate: new Date(Date.now() + 172800000), // Day after tomorrow
          endDate: new Date(Date.now() + 172800000 + 28800000), // Day after tomorrow + 8 hours
          location: {
            type: 'Point',
            coordinates: [-74.006, 40.7589], // NYC Central Park area
            address: 'Central Park, New York, NY 10024',
            city: 'New York',
            state: 'NY',
            country: 'USA'
          },
          capacity: 5000,
          price: 25,
          tags: ['live-music', 'festival', 'outdoor', 'summer'],
          host: users[1]._id,
          status: 'active'
        },
        {
          title: 'Food & Wine Tasting',
          description: 'Experience the finest wines and gourmet dishes from around the world. Perfect for food enthusiasts and wine connoisseurs.',
          category: 'food',
          startDate: new Date(Date.now() + 259200000), // 3 days from now
          endDate: new Date(Date.now() + 259200000 + 10800000), // 3 days from now + 3 hours
          location: {
            type: 'Point',
            coordinates: [-74.006, 40.7505], // NYC Midtown
            address: '456 Gourmet Avenue, New York, NY 10018',
            city: 'New York',
            state: 'NY',
            country: 'USA'
          },
          capacity: 100,
          price: 75,
          tags: ['wine', 'gourmet', 'tasting', 'fine-dining'],
          host: users[2]._id,
          status: 'active'
        },
        {
          title: 'Startup Pitch Night',
          description: 'Watch innovative startups pitch their ideas to investors and get feedback from industry experts. Great networking opportunity.',
          category: 'business',
          startDate: new Date(Date.now() + 345600000), // 4 days from now
          endDate: new Date(Date.now() + 345600000 + 7200000), // 4 days from now + 2 hours
          location: {
            type: 'Point',
            coordinates: [-74.006, 40.7589], // NYC Financial District
            address: '789 Startup Hub, New York, NY 10005',
            city: 'New York',
            state: 'NY',
            country: 'USA'
          },
          capacity: 200,
          price: 15,
          tags: ['startup', 'pitch', 'investors', 'networking'],
          host: users[3]._id,
          status: 'active'
        },
        {
          title: 'Yoga in the Park',
          description: 'Start your morning with a refreshing yoga session in the beautiful park. All levels welcome, bring your own mat.',
          category: 'wellness',
          startDate: new Date(Date.now() + 432000000), // 5 days from now
          endDate: new Date(Date.now() + 432000000 + 5400000), // 5 days from now + 1.5 hours
          location: {
            type: 'Point',
            coordinates: [-74.006, 40.7589], // NYC Park
            address: 'Central Park, New York, NY 10024',
            city: 'New York',
            state: 'NY',
            country: 'USA'
          },
          capacity: 50,
          price: 0,
          tags: ['yoga', 'wellness', 'outdoor', 'morning'],
          host: users[4]._id,
          status: 'active'
        }
      ];

      // Clear existing events
      await Event.deleteMany({});
      
      // Create new events
      const createdEvents = await Event.create(events);
      
      console.log(`✅ Created ${createdEvents.length} events`);
      
      // Add some attendees randomly
      for (const event of createdEvents) {
        const randomAttendees = users
          .filter(user => user._id.toString() !== event.host.toString())
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 3) + 1);
        
        event.attendees = randomAttendees.map(user => user._id);
        await event.save();
      }
      
      console.log('✅ Events seeded successfully with attendees');
      
    } catch (error) {
      console.error('❌ Error seeding events:', error);
      throw error;
    }
  }

  async clear() {
    try {
      await Event.deleteMany({});
      console.log('🗑️ Events cleared');
    } catch (error) {
      console.error('❌ Error clearing events:', error);
      throw error;
    }
  }
}

module.exports = new EventSeeder();