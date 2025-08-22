const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
require('dotenv').config({ path: '../../.env' });

// Import models
const User = require('../models/User');
const Event = require('../models/Event');
const Tribe = require('../models/Tribe');
const Post = require('../models/Post');
const Review = require('../models/Review');

// Categories
const eventCategories = ['Música', 'Deportes', 'Arte', 'Tecnología', 'Gastronomía', 'Educación', 'Negocios', 'Salud'];
const tribeCategories = ['Profesional', 'Hobby', 'Social', 'Educativo', 'Deportivo', 'Cultural'];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Tribe.deleteMany({}),
      Post.deleteMany({}),
      Review.deleteMany({})
    ]);
    console.log('🗑️  Base de datos limpiada');

    // Create users
    const users = [];
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // Create test users
    const testUsers = [
      {
        email: 'user@eventconnect.com',
        username: 'testuser',
        password: hashedPassword,
        role: 'user',
        isActive: true,
        isEmailVerified: true,
        profile: {
          firstName: 'Test',
          lastName: 'User',
          bio: 'Usuario de prueba de EventConnect',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=testuser`,
          location: {
            city: 'Madrid',
            country: 'España',
            coordinates: {
              latitude: 40.4168,
              longitude: -3.7038
            }
          }
        }
      },
      {
        email: 'moderator@eventconnect.com',
        username: 'moderator',
        password: hashedPassword,
        role: 'moderator',
        isActive: true,
        isEmailVerified: true,
        profile: {
          firstName: 'Mod',
          lastName: 'Erator',
          bio: 'Moderador de EventConnect',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=moderator`
        }
      }
    ];

    for (const userData of testUsers) {
      const user = await User.create(userData);
      users.push(user);
    }

    // Create random users
    for (let i = 0; i < 20; i++) {
      const username = faker.internet.userName().toLowerCase();
      const user = await User.create({
        email: faker.internet.email().toLowerCase(),
        username: username,
        password: hashedPassword,
        role: 'user',
        isActive: true,
        isEmailVerified: Math.random() > 0.2,
        profile: {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          bio: faker.lorem.paragraph(),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          location: {
            city: faker.location.city(),
            country: faker.location.country(),
            coordinates: {
              latitude: parseFloat(faker.location.latitude()),
              longitude: parseFloat(faker.location.longitude())
            }
          },
          interests: faker.helpers.arrayElements(eventCategories, 3)
        }
      });
      users.push(user);
    }
    console.log(`✅ ${users.length} usuarios creados`);

    // Create tribes
    const tribes = [];
    for (let i = 0; i < 15; i++) {
      const creator = faker.helpers.arrayElement(users);
      const members = faker.helpers.arrayElements(users, faker.number.int({ min: 5, max: 20 }));
      
      const tribe = await Tribe.create({
        name: faker.company.name() + ' ' + faker.helpers.arrayElement(['Club', 'Community', 'Group', 'Squad']),
        description: faker.lorem.paragraphs(2),
        category: faker.helpers.arrayElement(tribeCategories),
        image: faker.image.urlPicsumPhotos({ width: 800, height: 400 }),
        creator: creator._id,
        members: members.map(m => m._id),
        moderators: [creator._id],
        rules: [
          'Respetar a todos los miembros',
          'No spam ni autopromoción',
          'Contenido relevante únicamente',
          'Ser amable y constructivo'
        ],
        tags: faker.helpers.arrayElements(['networking', 'eventos', 'social', 'profesional', 'hobby', 'aprendizaje'], 3),
        isPublic: true,
        stats: {
          memberCount: members.length,
          postCount: 0,
          eventCount: 0
        }
      });
      tribes.push(tribe);
    }
    console.log(`✅ ${tribes.length} tribus creadas`);

    // Create events
    const events = [];
    for (let i = 0; i < 30; i++) {
      const organizer = faker.helpers.arrayElement(users);
      const tribe = Math.random() > 0.5 ? faker.helpers.arrayElement(tribes) : null;
      const attendees = faker.helpers.arrayElements(users, faker.number.int({ min: 10, max: 50 }));
      
      const startDate = faker.date.future();
      const endDate = new Date(startDate.getTime() + faker.number.int({ min: 1, max: 8 }) * 60 * 60 * 1000);
      
      const event = await Event.create({
        title: faker.lorem.words(3) + ' ' + faker.helpers.arrayElement(['Festival', 'Conference', 'Meetup', 'Workshop', 'Party']),
        description: faker.lorem.paragraphs(3),
        category: faker.helpers.arrayElement(eventCategories),
        images: [faker.image.urlPicsumPhotos({ width: 1200, height: 600 })],
        startDate,
        endDate,
        location: {
          type: 'Point',
          coordinates: [parseFloat(faker.location.longitude()), parseFloat(faker.location.latitude())],
          address: faker.location.streetAddress(),
          city: faker.location.city(),
          country: faker.location.country(),
          venue: faker.company.name() + ' ' + faker.helpers.arrayElement(['Hall', 'Center', 'Arena', 'Studio'])
        },
        organizer: organizer._id,
        tribe: tribe?._id,
        attendees: attendees.map(a => a._id),
        capacity: faker.number.int({ min: 50, max: 500 }),
        price: {
          amount: Math.random() > 0.5 ? 0 : faker.number.int({ min: 10, max: 100 }),
          currency: 'EUR'
        },
        tags: faker.helpers.arrayElements(['música', 'cultura', 'networking', 'educación', 'tecnología', 'arte'], 3),
        status: 'active',
        visibility: 'public',
        stats: {
          views: faker.number.int({ min: 100, max: 5000 }),
          likes: faker.number.int({ min: 10, max: 500 }),
          shares: faker.number.int({ min: 5, max: 100 }),
          attendeeCount: attendees.length
        }
      });
      events.push(event);
    }
    console.log(`✅ ${events.length} eventos creados`);

    // Create posts in tribes
    const posts = [];
    for (const tribe of tribes) {
      const postCount = faker.number.int({ min: 5, max: 15 });
      for (let i = 0; i < postCount; i++) {
        const author = faker.helpers.arrayElement(tribe.members);
        const post = await Post.create({
          content: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
          author: author,
          tribe: tribe._id,
          images: Math.random() > 0.7 ? [faker.image.urlPicsumPhotos()] : [],
          likes: faker.helpers.arrayElements(users, faker.number.int({ min: 0, max: 20 })).map(u => u._id),
          visibility: 'public',
          tags: faker.helpers.arrayElements(['discusión', 'anuncio', 'pregunta', 'recurso'], 2)
        });
        posts.push(post);
      }
      
      // Update tribe post count
      tribe.stats.postCount = postCount;
      await tribe.save();
    }
    console.log(`✅ ${posts.length} publicaciones creadas`);

    // Create reviews for events
    const reviews = [];
    for (const event of events) {
      const reviewCount = faker.number.int({ min: 3, max: 15 });
      for (let i = 0; i < reviewCount; i++) {
        const reviewer = faker.helpers.arrayElement(event.attendees);
        const review = await Review.create({
          event: event._id,
          user: reviewer,
          rating: faker.number.int({ min: 3, max: 5 }),
          title: faker.lorem.words(faker.number.int({ min: 3, max: 6 })),
          comment: faker.lorem.paragraph(),
          helpful: faker.helpers.arrayElements(users, faker.number.int({ min: 0, max: 10 })).map(u => u._id),
          verified: true
        });
        reviews.push(review);
      }
    }
    console.log(`✅ ${reviews.length} reseñas creadas`);

    console.log('\n🎉 Base de datos poblada exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`- Usuarios: ${users.length}`);
    console.log(`- Tribus: ${tribes.length}`);
    console.log(`- Eventos: ${events.length}`);
    console.log(`- Publicaciones: ${posts.length}`);
    console.log(`- Reseñas: ${reviews.length}`);
    
    console.log('\n🔑 Usuarios de prueba:');
    console.log('- Email: user@eventconnect.com | Password: Password123!');
    console.log('- Email: moderator@eventconnect.com | Password: Password123!');
    console.log('- Email: admin@eventconnect.com | Password: Admin123!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run seeder
seedDatabase();