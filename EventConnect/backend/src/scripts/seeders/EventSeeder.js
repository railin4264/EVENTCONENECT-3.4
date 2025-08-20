const { database } = require('../../config');
const { Event, User } = require('../../models');

class EventSeeder {
  constructor() {
    this.events = [];
  }

  /**
   * Generate sample events for development and testing
   * @param count
   */
  async generateEvents(count = 100) {
    try {
      console.log('🎉 Generating sample events...');

      // Get sample users for hosting events
      const users = await User.find({ isVerified: true }).select(
        '_id username interests location'
      );
      if (users.length === 0) {
        throw new Error('No users found. Please seed users first.');
      }

      const sampleEvents = [
        {
          title: 'Tech Startup Meetup 2024',
          description:
            'Join us for an evening of networking with fellow entrepreneurs and tech enthusiasts. Learn about the latest trends in startup culture and share your ideas.',
          category: 'technology',
          subcategory: 'startups',
          tags: ['startup', 'entrepreneurship', 'networking', 'tech'],
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          endDate: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000
          ), // 3 hours later
          location: {
            type: 'Point',
            coordinates: [-122.4194, 37.7749], // San Francisco
            address: '123 Innovation Drive, San Francisco, CA 94105',
            city: 'San Francisco',
            state: 'CA',
            country: 'USA',
            venue: 'Tech Hub SF',
          },
          capacity: 150,
          pricing: {
            type: 'free',
            price: 0,
            currency: 'USD',
          },
          isPrivate: false,
          status: 'active',
        },
        {
          title: 'Jazz Night at Blue Note',
          description:
            'Experience the smooth sounds of jazz in an intimate setting. Featuring local musicians and special guest performers.',
          category: 'music',
          subcategory: 'jazz',
          tags: ['jazz', 'live-music', 'nightlife', 'culture'],
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          endDate: new Date(
            Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000
          ), // 4 hours later
          location: {
            type: 'Point',
            coordinates: [-74.006, 40.7128], // New York
            address: '131 W 3rd St, New York, NY 10012',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            venue: 'Blue Note Jazz Club',
          },
          capacity: 80,
          pricing: {
            type: 'paid',
            price: 45,
            currency: 'USD',
          },
          isPrivate: false,
          status: 'active',
        },
        {
          title: 'Art Gallery Opening: Modern Perspectives',
          description:
            'Discover contemporary art from emerging artists. Wine and cheese reception included. Meet the artists and discuss their work.',
          category: 'art',
          subcategory: 'exhibition',
          tags: ['art', 'gallery', 'exhibition', 'culture', 'networking'],
          startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          endDate: new Date(
            Date.now() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000
          ), // 3 hours later
          location: {
            type: 'Point',
            coordinates: [-118.2437, 34.0522], // Los Angeles
            address: '456 Art District Blvd, Los Angeles, CA 90012',
            city: 'Los Angeles',
            state: 'CA',
            country: 'USA',
            venue: 'Modern Art Gallery',
          },
          capacity: 120,
          pricing: {
            type: 'paid',
            price: 25,
            currency: 'USD',
          },
          isPrivate: false,
          status: 'active',
        },
        {
          title: 'Community Garden Workshop',
          description:
            'Learn sustainable gardening techniques and help maintain our community garden. All skill levels welcome. Tools provided.',
          category: 'education',
          subcategory: 'workshop',
          tags: [
            'gardening',
            'sustainability',
            'community',
            'workshop',
            'outdoor',
          ],
          startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          endDate: new Date(
            Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
          ), // 2 hours later
          location: {
            type: 'Point',
            coordinates: [-87.6298, 41.8781], // Chicago
            address: '789 Green Street, Chicago, IL 60601',
            city: 'Chicago',
            state: 'IL',
            country: 'USA',
            venue: 'Community Garden Center',
          },
          capacity: 30,
          pricing: {
            type: 'free',
            price: 0,
            currency: 'USD',
          },
          isPrivate: false,
          status: 'active',
        },
        {
          title: 'Food Truck Festival',
          description:
            'A celebration of local cuisine featuring 20+ food trucks, live music, and family activities. Bring your appetite!',
          category: 'food',
          subcategory: 'festival',
          tags: ['food', 'festival', 'local-business', 'family', 'outdoor'],
          startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          endDate: new Date(
            Date.now() + 10 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000
          ), // 8 hours later
          location: {
            type: 'Point',
            coordinates: [-80.1918, 25.7617], // Miami
            address: '321 Food Court Ave, Miami, FL 33101',
            city: 'Miami',
            state: 'FL',
            country: 'USA',
            venue: 'Miami Food Truck Park',
          },
          capacity: 500,
          pricing: {
            type: 'paid',
            price: 15,
            currency: 'USD',
          },
          isPrivate: false,
          status: 'active',
        },
      ];

      // Generate additional random events
      for (let i = 6; i <= count; i++) {
        const event = this.generateRandomEvent(users, i);
        sampleEvents.push(event);
      }

      // Create event objects
      for (const eventData of sampleEvents) {
        const event = new Event({
          ...eventData,
          host:
            eventData.host ||
            users[Math.floor(Math.random() * users.length)]._id,
          attendees: this.generateRandomAttendees(users, eventData.capacity),
          likes: this.generateRandomLikes(users),
          images: this.generateRandomImages(eventData.category),
          requirements: this.generateRandomRequirements(eventData.category),
          social: this.generateRandomSocialStats(),
        });
        this.events.push(event);
      }

      console.log(`✅ Generated ${this.events.length} sample events`);
      return this.events;
    } catch (error) {
      console.error('❌ Error generating events:', error);
      throw error;
    }
  }

  /**
   * Generate a random event with realistic data
   * @param users
   * @param index
   */
  generateRandomEvent(users, index) {
    const categories = [
      {
        name: 'music',
        subcategories: [
          'concert',
          'festival',
          'jazz',
          'rock',
          'electronic',
          'classical',
        ],
      },
      {
        name: 'art',
        subcategories: [
          'exhibition',
          'workshop',
          'gallery',
          'performance',
          'crafts',
        ],
      },
      {
        name: 'technology',
        subcategories: [
          'conference',
          'workshop',
          'hackathon',
          'meetup',
          'seminar',
        ],
      },
      {
        name: 'sports',
        subcategories: ['tournament', 'training', 'game', 'fitness', 'outdoor'],
      },
      {
        name: 'food',
        subcategories: [
          'festival',
          'tasting',
          'cooking-class',
          'dinner',
          'market',
        ],
      },
      {
        name: 'education',
        subcategories: [
          'workshop',
          'lecture',
          'course',
          'seminar',
          'conference',
        ],
      },
      {
        name: 'business',
        subcategories: [
          'networking',
          'conference',
          'workshop',
          'meetup',
          'seminar',
        ],
      },
      {
        name: 'health',
        subcategories: ['workshop', 'class', 'seminar', 'retreat', 'wellness'],
      },
      {
        name: 'travel',
        subcategories: [
          'tour',
          'adventure',
          'cultural',
          'outdoor',
          'exploration',
        ],
      },
      {
        name: 'community',
        subcategories: [
          'meetup',
          'volunteer',
          'celebration',
          'gathering',
          'festival',
        ],
      },
    ];

    const category = categories[Math.floor(Math.random() * categories.length)];
    const subcategory =
      category.subcategories[
        Math.floor(Math.random() * category.subcategories.length)
      ];
    const host = users[Math.floor(Math.random() * users.length)];

    // Generate dates (between 1 day and 3 months from now)
    const daysFromNow = Math.floor(Math.random() * 90) + 1;
    const startDate = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
    const duration = Math.floor(Math.random() * 6) + 1; // 1-6 hours
    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);

    // Generate location based on host's location
    const hostLocation = host.location;
    const locationVariation = 0.01; // Small variation from host location
    const coordinates = [
      hostLocation.coordinates[0] + (Math.random() - 0.5) * locationVariation,
      hostLocation.coordinates[1] + (Math.random() - 0.5) * locationVariation,
    ];

    const capacity = Math.floor(Math.random() * 200) + 20; // 20-220 people
    const isFree = Math.random() > 0.6; // 40% free events
    const price = isFree ? 0 : Math.floor(Math.random() * 100) + 10; // $10-$110

    return {
      title: this.generateEventTitle(category.name, subcategory),
      description: this.generateEventDescription(category.name, subcategory),
      category: category.name,
      subcategory,
      tags: this.generateEventTags(category.name, subcategory),
      startDate,
      endDate,
      location: {
        type: 'Point',
        coordinates,
        address: this.generateRandomAddress(
          hostLocation.city,
          hostLocation.state
        ),
        city: hostLocation.city,
        state: hostLocation.state,
        country: hostLocation.country,
        venue: this.generateRandomVenue(category.name),
      },
      capacity,
      pricing: {
        type: isFree ? 'free' : 'paid',
        price,
        currency: 'USD',
      },
      isPrivate: Math.random() > 0.9, // 10% private events
      status: 'active',
      host: host._id,
    };
  }

  /**
   * Generate event title based on category and subcategory
   * @param category
   * @param subcategory
   */
  generateEventTitle(category, subcategory) {
    const titles = {
      music: {
        concert: [
          'Live Music Night',
          'Concert Under the Stars',
          'Acoustic Evening',
        ],
        festival: [
          'Music Festival 2024',
          'Summer Sounds Festival',
          'Rhythm & Blues Fest',
        ],
        jazz: ['Jazz Night', 'Smooth Jazz Evening', 'Jazz & Wine Night'],
      },
      art: {
        exhibition: [
          'Art Gallery Opening',
          'Contemporary Art Show',
          'Artist Spotlight',
        ],
        workshop: [
          'Art Workshop',
          'Creative Expression Class',
          'Painting Workshop',
        ],
      },
      technology: {
        conference: [
          'Tech Conference 2024',
          'Innovation Summit',
          'Future of Tech',
        ],
        workshop: ['Coding Workshop', 'AI Workshop', 'Web Development Class'],
      },
      food: {
        festival: [
          'Food Truck Festival',
          'Taste of the City',
          'Culinary Festival',
        ],
        tasting: ['Wine Tasting', 'Beer Tasting', 'Cheese & Wine Pairing'],
      },
    };

    if (titles[category] && titles[category][subcategory]) {
      const categoryTitles = titles[category][subcategory];
      return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
    }

    // Generic titles
    const genericTitles = [
      `${category.charAt(0).toUpperCase() + category.slice(1)} Meetup`,
      `${category.charAt(0).toUpperCase() + category.slice(1)} Workshop`,
      `${category.charAt(0).toUpperCase() + category.slice(1)} Night`,
      `${category.charAt(0).toUpperCase() + category.slice(1)} Festival`,
    ];

    return genericTitles[Math.floor(Math.random() * genericTitles.length)];
  }

  /**
   * Generate event description
   * @param category
   * @param subcategory
   */
  generateEventDescription(category, subcategory) {
    const descriptions = {
      music:
        'Join us for an amazing evening of live music and entertainment. Experience the energy and passion of talented musicians in an intimate setting.',
      art: 'Discover the creative world of art and culture. Meet local artists, explore their work, and get inspired by their unique perspectives.',
      technology:
        'Learn about the latest trends and innovations in technology. Network with industry professionals and expand your knowledge.',
      food: 'Savor delicious cuisine from local chefs and food vendors. Experience the diverse flavors and culinary traditions of our community.',
      sports:
        "Get active and have fun with fellow sports enthusiasts. Whether you're a beginner or experienced, there's something for everyone.",
      education:
        'Expand your knowledge and skills through interactive learning experiences. Connect with experts and fellow learners.',
      business:
        'Build your professional network and discover new opportunities. Share insights and learn from successful entrepreneurs.',
      health:
        'Focus on your well-being and personal growth. Learn healthy habits and connect with wellness professionals.',
      travel:
        'Explore new places and cultures through guided experiences. Create lasting memories and make new friends.',
      community:
        'Connect with your neighbors and build a stronger community. Participate in local activities and make a difference.',
    };

    return (
      descriptions[category] ||
      'Join us for an exciting event where you can meet new people, learn new things, and have a great time!'
    );
  }

  /**
   * Generate event tags
   * @param category
   * @param subcategory
   */
  generateEventTags(category, subcategory) {
    const tagMap = {
      music: ['music', 'live', 'entertainment', 'performance'],
      art: ['art', 'culture', 'creative', 'exhibition'],
      technology: ['tech', 'innovation', 'learning', 'networking'],
      food: ['food', 'cuisine', 'tasting', 'culinary'],
      sports: ['sports', 'fitness', 'active', 'outdoor'],
      education: ['education', 'learning', 'workshop', 'skill-building'],
      business: ['business', 'networking', 'professional', 'entrepreneurship'],
      health: ['health', 'wellness', 'fitness', 'mindfulness'],
      travel: ['travel', 'adventure', 'exploration', 'culture'],
      community: ['community', 'local', 'social', 'volunteer'],
    };

    const baseTags = tagMap[category] || [category];
    const additionalTags = ['networking', 'social', 'fun', 'local'];

    // Add some random additional tags
    const randomTags = additionalTags
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3));

    return [...baseTags, ...randomTags];
  }

  /**
   * Generate random address
   * @param city
   * @param state
   */
  generateRandomAddress(city, state) {
    const streetNumbers = ['123', '456', '789', '321', '654', '987'];
    const streetNames = [
      'Main St',
      'Oak Ave',
      'Pine Rd',
      'Elm St',
      'Maple Dr',
      'Cedar Ln',
    ];
    const streetNumber =
      streetNumbers[Math.floor(Math.random() * streetNumbers.length)];
    const streetName =
      streetNames[Math.floor(Math.random() * streetNames.length)];

    return `${streetNumber} ${streetName}, ${city}, ${state}`;
  }

  /**
   * Generate random venue name
   * @param category
   */
  generateRandomVenue(category) {
    const venues = {
      music: ['Music Hall', 'Concert Venue', 'Jazz Club', 'Live Music Bar'],
      art: ['Art Gallery', 'Creative Space', 'Studio Gallery', 'Art Center'],
      technology: [
        'Tech Hub',
        'Innovation Center',
        'Tech Space',
        'Digital Hub',
      ],
      food: ['Food Court', 'Culinary Center', 'Tasting Room', 'Food Hall'],
      sports: [
        'Sports Center',
        'Fitness Club',
        'Athletic Complex',
        'Sports Arena',
      ],
      education: [
        'Learning Center',
        'Education Hub',
        'Workshop Space',
        'Training Center',
      ],
      business: [
        'Business Center',
        'Conference Hall',
        'Meeting Space',
        'Business Hub',
      ],
      health: [
        'Wellness Center',
        'Health Club',
        'Fitness Studio',
        'Wellness Space',
      ],
      travel: [
        'Adventure Center',
        'Travel Hub',
        'Exploration Base',
        'Adventure Base',
      ],
      community: [
        'Community Center',
        'Town Hall',
        'Community Space',
        'Gathering Place',
      ],
    };

    const categoryVenues = venues[category] || [
      'Event Space',
      'Community Center',
      'Meeting Hall',
    ];
    return categoryVenues[Math.floor(Math.random() * categoryVenues.length)];
  }

  /**
   * Generate random attendees
   * @param users
   * @param capacity
   */
  generateRandomAttendees(users, capacity) {
    const attendeeCount =
      Math.floor(Math.random() * capacity * 0.8) + Math.floor(capacity * 0.2);
    const shuffledUsers = users.sort(() => 0.5 - Math.random());
    return shuffledUsers.slice(0, attendeeCount).map(user => user._id);
  }

  /**
   * Generate random likes
   * @param users
   */
  generateRandomLikes(users) {
    const likeCount = Math.floor(Math.random() * users.length * 0.3);
    const shuffledUsers = users.sort(() => 0.5 - Math.random());
    return shuffledUsers.slice(0, likeCount).map(user => user._id);
  }

  /**
   * Generate random images
   * @param category
   */
  generateRandomImages(category) {
    const imageCount = Math.floor(Math.random() * 3) + 1;
    const images = [];

    for (let i = 0; i < imageCount; i++) {
      images.push({
        url: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
        alt: `${category} event image ${i + 1}`,
        isPrimary: i === 0,
      });
    }

    return images;
  }

  /**
   * Generate random requirements
   * @param category
   */
  generateRandomRequirements(category) {
    const requirements = [];

    if (category === 'sports') {
      requirements.push('Comfortable clothing and shoes');
      if (Math.random() > 0.5) requirements.push('Water bottle');
    }

    if (category === 'food') {
      if (Math.random() > 0.5) requirements.push('Dietary restrictions notice');
    }

    if (category === 'technology') {
      if (Math.random() > 0.5) requirements.push('Laptop (optional)');
    }

    if (Math.random() > 0.7) requirements.push('RSVP required');

    return requirements;
  }

  /**
   * Generate random social stats
   */
  generateRandomSocialStats() {
    return {
      shareCount: Math.floor(Math.random() * 50),
      saveCount: Math.floor(Math.random() * 30),
      commentCount: Math.floor(Math.random() * 20),
    };
  }

  /**
   * Seed events to database
   */
  async seed() {
    try {
      console.log('🎉 Starting event seeding...');

      // Check if events already exist
      const existingEvents = await Event.countDocuments();
      if (existingEvents > 0) {
        console.log(
          `⚠️  Events already exist (${existingEvents}). Skipping seeding.`
        );
        return [];
      }

      // Generate events
      const events = await this.generateEvents();

      // Insert events
      const insertedEvents = await Event.insertMany(events);

      console.log(`✅ Successfully seeded ${insertedEvents.length} events`);
      return insertedEvents;
    } catch (error) {
      console.error('❌ Error seeding events:', error);
      throw error;
    }
  }

  /**
   * Clear all events (use with caution)
   */
  async clear() {
    try {
      console.log('🗑️  Clearing all events...');
      const result = await Event.deleteMany({});
      console.log(`✅ Cleared ${result.deletedCount} events`);
      return result;
    } catch (error) {
      console.error('❌ Error clearing events:', error);
      throw error;
    }
  }

  /**
   * Get sample events for testing
   * @param limit
   */
  async getSampleEvents(limit = 10) {
    try {
      const events = await Event.find({ status: 'active' })
        .populate('host', 'username avatar rating')
        .select(
          'title description category startDate location capacity pricing'
        )
        .limit(limit);
      return events;
    } catch (error) {
      console.error('❌ Error getting sample events:', error);
      throw error;
    }
  }
}

module.exports = new EventSeeder();
