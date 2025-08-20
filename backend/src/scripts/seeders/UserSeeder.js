const bcrypt = require('bcryptjs');

const { database } = require('../../config');
const { User } = require('../../models');

class UserSeeder {
  constructor() {
    this.users = [];
  }

  /**
   * Generate sample users for development and testing
   * @param count
   */
  async generateUsers(count = 50) {
    try {
      console.log('🌱 Generating sample users...');

      const sampleUsers = [
        {
          username: 'admin',
          email: 'admin@eventconnect.com',
          password: 'admin123',
          firstName: 'Admin',
          lastName: 'User',
          bio: 'System administrator for EventConnect',
          isAdmin: true,
          isVerified: true,
          rating: 5.0,
          interests: ['technology', 'business', 'networking'],
          location: {
            type: 'Point',
            coordinates: [-74.006, 40.7128], // New York
            address: 'New York, NY, USA',
            city: 'New York',
            state: 'NY',
            country: 'USA',
          },
        },
        {
          username: 'johndoe',
          email: 'john@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          bio: 'Event organizer and community builder',
          isVerified: true,
          rating: 4.8,
          interests: ['music', 'art', 'community'],
          location: {
            type: 'Point',
            coordinates: [-118.2437, 34.0522], // Los Angeles
            address: 'Los Angeles, CA, USA',
            city: 'Los Angeles',
            state: 'CA',
            country: 'USA',
          },
        },
        {
          username: 'janesmith',
          email: 'jane@example.com',
          password: 'password123',
          firstName: 'Jane',
          lastName: 'Smith',
          bio: 'Passionate about bringing people together through events',
          isVerified: true,
          rating: 4.9,
          interests: ['food', 'culture', 'travel'],
          location: {
            type: 'Point',
            coordinates: [-87.6298, 41.8781], // Chicago
            address: 'Chicago, IL, USA',
            city: 'Chicago',
            state: 'IL',
            country: 'USA',
          },
        },
        {
          username: 'mikejohnson',
          email: 'mike@example.com',
          password: 'password123',
          firstName: 'Mike',
          lastName: 'Johnson',
          bio: 'Tech enthusiast and startup founder',
          isVerified: true,
          rating: 4.7,
          interests: ['technology', 'startups', 'innovation'],
          location: {
            type: 'Point',
            coordinates: [-122.4194, 37.7749], // San Francisco
            address: 'San Francisco, CA, USA',
            city: 'San Francisco',
            state: 'CA',
            country: 'USA',
          },
        },
        {
          username: 'sarahwilson',
          email: 'sarah@example.com',
          password: 'password123',
          firstName: 'Sarah',
          lastName: 'Wilson',
          bio: 'Creative director and event planner',
          isVerified: true,
          rating: 4.6,
          interests: ['design', 'creativity', 'events'],
          location: {
            type: 'Point',
            coordinates: [-80.1918, 25.7617], // Miami
            address: 'Miami, FL, USA',
            city: 'Miami',
            state: 'FL',
            country: 'USA',
          },
        },
      ];

      // Generate additional random users
      for (let i = 6; i <= count; i++) {
        const user = this.generateRandomUser(i);
        sampleUsers.push(user);
      }

      // Hash passwords and create users
      for (const userData of sampleUsers) {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        const user = new User({
          ...userData,
          password: hashedPassword,
          notificationPreferences: this.generateNotificationPreferences(),
          stats: this.generateUserStats(),
        });
        this.users.push(user);
      }

      console.log(`✅ Generated ${this.users.length} sample users`);
      return this.users;
    } catch (error) {
      console.error('❌ Error generating users:', error);
      throw error;
    }
  }

  /**
   * Generate a random user with realistic data
   * @param index
   */
  generateRandomUser(index) {
    const firstNames = [
      'Alex',
      'Jordan',
      'Taylor',
      'Casey',
      'Riley',
      'Morgan',
      'Quinn',
      'Avery',
      'Blake',
      'Cameron',
      'Drew',
      'Emery',
      'Finley',
      'Gray',
      'Harper',
      'Indigo',
      'Jamie',
      'Kendall',
      'Logan',
      'Mason',
      'Nova',
      'Oakley',
      'Parker',
      'Quinn',
      'River',
      'Sage',
      'Tatum',
      'Unity',
      'Vale',
      'Winter',
      'Xander',
      'Yuki',
      'Zara',
    ];

    const lastNames = [
      'Anderson',
      'Brown',
      'Davis',
      'Garcia',
      'Johnson',
      'Jones',
      'Miller',
      'Moore',
      'Smith',
      'Taylor',
      'Thomas',
      'White',
      'Wilson',
      'Young',
      'Adams',
      'Baker',
      'Campbell',
      'Carter',
      'Clark',
      'Collins',
      'Cook',
      'Cooper',
      'Evans',
      'Green',
      'Hall',
      'Harris',
      'Jackson',
      'Lee',
      'Lewis',
      'Martin',
      'Mitchell',
      'Nelson',
      'Parker',
      'Phillips',
    ];

    const interests = [
      'music',
      'art',
      'technology',
      'sports',
      'food',
      'travel',
      'business',
      'education',
      'health',
      'fitness',
      'photography',
      'writing',
      'gaming',
      'fashion',
      'beauty',
      'automotive',
      'pets',
      'gardening',
      'diy',
      'parenting',
      'finance',
      'real-estate',
      'politics',
      'science',
    ];

    const cities = [
      { name: 'New York', coords: [-74.006, 40.7128], state: 'NY' },
      { name: 'Los Angeles', coords: [-118.2437, 34.0522], state: 'CA' },
      { name: 'Chicago', coords: [-87.6298, 41.8781], state: 'IL' },
      { name: 'Houston', coords: [-95.3698, 29.7604], state: 'TX' },
      { name: 'Phoenix', coords: [-112.074, 33.4484], state: 'AZ' },
      { name: 'Philadelphia', coords: [-75.1652, 39.9526], state: 'PA' },
      { name: 'San Antonio', coords: [-98.4936, 29.4241], state: 'TX' },
      { name: 'San Diego', coords: [-117.1611, 32.7157], state: 'CA' },
      { name: 'Dallas', coords: [-96.797, 32.7767], state: 'TX' },
      { name: 'San Jose', coords: [-121.8863, 37.3382], state: 'CA' },
    ];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const userInterests = interests
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 5) + 2);

    return {
      username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${index}`,
      email: `${firstName.toLowerCase()}${lastName.toLowerCase()}${index}@example.com`,
      password: 'password123',
      firstName,
      lastName,
      bio: this.generateRandomBio(firstName, userInterests),
      isVerified: Math.random() > 0.1, // 90% verified
      rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0 - 5.0
      interests: userInterests,
      location: {
        type: 'Point',
        coordinates: [
          city.coords[0] + (Math.random() - 0.5) * 0.1, // Add some randomness
          city.coords[1] + (Math.random() - 0.5) * 0.1,
        ],
        address: `${city.name}, ${city.state}, USA`,
        city: city.name,
        state: city.state,
        country: 'USA',
      },
      age: Math.floor(Math.random() * 42) + 18, // 18-60
      gender: ['male', 'female', 'other'][Math.floor(Math.random() * 3)],
      phone: this.generateRandomPhone(),
      website:
        Math.random() > 0.7
          ? `https://${firstName.toLowerCase()}.com`
          : undefined,
    };
  }

  /**
   * Generate a random bio based on interests
   * @param firstName
   * @param interests
   */
  generateRandomBio(firstName, interests) {
    const bios = [
      `${firstName} is passionate about ${interests[0]} and loves connecting with like-minded people.`,
      `When not working, ${firstName} enjoys ${interests.join(', ')} and building community.`,
      `${firstName} believes in the power of ${interests[0]} to bring people together.`,
      `A dedicated ${interests[0]} enthusiast, ${firstName} is always looking for new experiences.`,
      `${firstName} loves exploring ${interests.join(' and ')} while meeting amazing people.`,
    ];

    return bios[Math.floor(Math.random() * bios.length)];
  }

  /**
   * Generate random phone number
   */
  generateRandomPhone() {
    const areaCodes = [
      '212',
      '310',
      '312',
      '713',
      '602',
      '215',
      '210',
      '619',
      '214',
      '408',
    ];
    const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
    const prefix = Math.floor(Math.random() * 900) + 100;
    const lineNumber = Math.floor(Math.random() * 9000) + 1000;
    return `+1-${areaCode}-${prefix}-${lineNumber}`;
  }

  /**
   * Generate notification preferences
   */
  generateNotificationPreferences() {
    return {
      event_invitation: Math.random() > 0.1,
      tribe_invitation: Math.random() > 0.1,
      friend_request: Math.random() > 0.1,
      post_mention: Math.random() > 0.2,
      event_reminder: Math.random() > 0.1,
      event_update: Math.random() > 0.1,
      tribe_update: Math.random() > 0.1,
      system_announcement: Math.random() > 0.3,
      push: Math.random() > 0.2,
      email: Math.random() > 0.3,
      sms: Math.random() > 0.1,
    };
  }

  /**
   * Generate user statistics
   */
  generateUserStats() {
    return {
      eventCount: Math.floor(Math.random() * 20),
      tribeCount: Math.floor(Math.random() * 10),
      postCount: Math.floor(Math.random() * 100),
      followerCount: Math.floor(Math.random() * 500),
      followingCount: Math.floor(Math.random() * 300),
      totalEventsAttended: Math.floor(Math.random() * 50),
      totalEventsHosted: Math.floor(Math.random() * 15),
      totalReviews: Math.floor(Math.random() * 30),
      averageRating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
    };
  }

  /**
   * Seed users to database
   */
  async seed() {
    try {
      console.log('🌱 Starting user seeding...');

      // Check if users already exist
      const existingUsers = await User.countDocuments();
      if (existingUsers > 0) {
        console.log(
          `⚠️  Users already exist (${existingUsers}). Skipping seeding.`
        );
        return [];
      }

      // Generate users
      const users = await this.generateUsers();

      // Insert users
      const insertedUsers = await User.insertMany(users);

      console.log(`✅ Successfully seeded ${insertedUsers.length} users`);
      return insertedUsers;
    } catch (error) {
      console.error('❌ Error seeding users:', error);
      throw error;
    }
  }

  /**
   * Clear all users (use with caution)
   */
  async clear() {
    try {
      console.log('🗑️  Clearing all users...');
      const result = await User.deleteMany({});
      console.log(`✅ Cleared ${result.deletedCount} users`);
      return result;
    } catch (error) {
      console.error('❌ Error clearing users:', error);
      throw error;
    }
  }

  /**
   * Get sample users for testing
   * @param limit
   */
  async getSampleUsers(limit = 10) {
    try {
      const users = await User.find({ isVerified: true })
        .select(
          'username email firstName lastName bio interests location rating'
        )
        .limit(limit);
      return users;
    } catch (error) {
      console.error('❌ Error getting sample users:', error);
      throw error;
    }
  }
}

module.exports = new UserSeeder();
