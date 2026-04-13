const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const { User, Event, Tribe, Post } = require('../../models');

// Datos de desarrollo para testing
const DEV_USERS = [
  {
    username: 'admin',
    email: 'admin@eventconnect.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'EventConnect',
    dateOfBirth: new Date('1990-01-01'),
    role: 'admin',
    isVerified: true,
    isActive: true,
    bio: 'Administrador principal de EventConnect',
    location: 'Madrid, España',
    interests: ['technology', 'business'],
  },
  {
    username: 'maria_dev',
    email: 'maria@example.com',
    password: 'dev123',
    firstName: 'María',
    lastName: 'González',
    dateOfBirth: new Date('1995-03-15'),
    role: 'user',
    isVerified: true,
    isActive: true,
    bio: 'Desarrolladora Frontend apasionada por React y el diseño UX.',
    location: 'Madrid, España',
    interests: ['technology', 'art', 'photography'],
  },
  {
    username: 'carlos_tech',
    email: 'carlos@example.com',
    password: 'dev123',
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    dateOfBirth: new Date('1992-07-22'),
    role: 'user',
    isVerified: true,
    isActive: true,
    bio: 'Backend developer especializado en Node.js y MongoDB.',
    location: 'Barcelona, España',
    interests: ['technology', 'music', 'food'],
  },
  {
    username: 'ana_design',
    email: 'ana@example.com',
    password: 'dev123',
    firstName: 'Ana',
    lastName: 'López',
    dateOfBirth: new Date('1993-11-08'),
    role: 'user',
    isVerified: true,
    isActive: true,
    bio: 'UX/UI Designer creando experiencias digitales increíbles.',
    location: 'Valencia, España',
    interests: ['art', 'education'],
  },
];

const DEV_EVENTS = [
  {
    title: 'Tech Meetup Barcelona 2024',
    description:
      'Únete a desarrolladores y entusiastas de la tecnología para una noche de networking y charlas inspiradoras sobre el futuro del desarrollo web, IA y blockchain.',
    category: 'technology',
    dateTime: {
      start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // En 7 días
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 horas después
    },
    location: {
      type: 'Point',
      coordinates: [2.1734, 41.3851], // Barcelona
      address: {
        street: 'Av. Diagonal 123',
        city: 'Barcelona',
        state: 'Barcelona',
        country: 'España',
        zipCode: '08028',
      },
    },
    capacity: 300,
    pricing: {
      type: 'free',
      amount: 0,
      currency: 'EUR',
    },
    tags: ['Web Development', 'AI', 'Blockchain', 'Networking'],
    status: 'published',
    visibility: 'public',
  },
  {
    title: 'Workshop de React Avanzado',
    description:
      'Aprende las técnicas más avanzadas de React: hooks personalizados, optimización de performance, testing avanzado y arquitectura escalable.',
    category: 'education',
    dateTime: {
      start: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // En 14 días
      end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // 6 horas después
    },
    location: {
      type: 'Point',
      coordinates: [-3.7038, 40.4168], // Madrid
      address: {
        street: 'Calle de la Innovación 45',
        city: 'Madrid',
        state: 'Madrid',
        country: 'España',
        zipCode: '28001',
      },
    },
    capacity: 50,
    pricing: {
      type: 'paid',
      amount: 75,
      currency: 'EUR',
    },
    tags: ['React', 'JavaScript', 'Frontend', 'Workshop'],
    status: 'published',
    visibility: 'public',
  },
  {
    title: 'Conferencia de UX/UI Design',
    description:
      'Los mejores diseñadores del país comparten sus experiencias y las últimas tendencias en diseño de experiencias de usuario.',
    category: 'art',
    dateTime: {
      start: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // En 21 días
      end: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 8 horas después
    },
    location: {
      type: 'Point',
      coordinates: [-0.3763, 39.4699], // Valencia
      address: {
        street: 'Av. de las Cortes Valencianas 60',
        city: 'Valencia',
        state: 'Valencia',
        country: 'España',
        zipCode: '46015',
      },
    },
    capacity: 500,
    pricing: {
      type: 'paid',
      amount: 120,
      currency: 'EUR',
    },
    tags: ['UX', 'UI', 'Design', 'User Experience'],
    status: 'published',
    visibility: 'public',
  },
];

const DEV_TRIBES = [
  {
    name: 'Desarrolladores Frontend',
    description:
      'Comunidad de desarrolladores especializados en tecnologías frontend como React, Vue, Angular y más.',
    category: 'technology',
    visibility: 'public',
    membershipType: 'open',
    tags: ['Frontend', 'React', 'Vue', 'Angular', 'JavaScript'],
    location: 'España',
  },
  {
    name: 'UX/UI Designers España',
    description:
      'Grupo para diseñadores UX/UI que quieren compartir conocimientos, proyectos y oportunidades profesionales.',
    category: 'art',
    visibility: 'public',
    membershipType: 'open',
    tags: ['UX', 'UI', 'Design', 'Figma', 'Prototipado'],
    location: 'España',
  },
  {
    name: 'Emprendedores Tech',
    description:
      'Red de emprendedores tecnológicos para networking, colaboración en proyectos y mentoría.',
    category: 'business',
    visibility: 'public',
    membershipType: 'moderated',
    tags: ['Emprendimiento', 'Startups', 'Tecnología', 'Networking'],
    location: 'España',
  },
];

/**
 *
 */
async function seedDevelopmentData() {
  try {
    console.log('🌱 Iniciando seed de datos de desarrollo...');

    // Limpiar datos existentes
    await User.deleteMany({});
    await Event.deleteMany({});
    await Tribe.deleteMany({});
    await Post.deleteMany({});

    // Crear usuarios
    console.log('👥 Creando usuarios de desarrollo...');
    const users = [];

    for (const userData of DEV_USERS) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await user.save();
      users.push(user);
      console.log(`✅ Usuario creado: ${user.username} (${user.email})`);
    }

    // Crear tribus
    console.log('🏘️ Creando tribus...');
    const tribes = [];

    for (let i = 0; i < DEV_TRIBES.length; i++) {
      const tribeData = DEV_TRIBES[i];
      const creator = users[i % users.length];

      const tribe = new Tribe({
        ...tribeData,
        creator: creator._id,
        admins: [creator._id],
        members: [creator._id],
        memberCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await tribe.save();
      tribes.push(tribe);
      console.log(`✅ Tribu creada: ${tribe.name}`);
    }

    // Crear eventos
    console.log('📅 Creando eventos...');

    for (let i = 0; i < DEV_EVENTS.length; i++) {
      const eventData = DEV_EVENTS[i];
      const host = users[i % users.length];

      const event = new Event({
        ...eventData,
        host: host._id,
        attendees: [host._id],
        attendeeCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await event.save();
      console.log(`✅ Evento creado: ${event.title}`);
    }

    // Nota: Posts omitidos por problemas de GeoJSON, se pueden añadir manualmente desde la app
    console.log('📝 Posts omitidos (se pueden crear desde la app)');

    console.log('\n🎉 ¡Seed de datos de desarrollo completado exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`👥 Usuarios: ${users.length}`);
    console.log(`🏘️ Tribus: ${tribes.length}`);
    console.log(`📅 Eventos: ${DEV_EVENTS.length}`);
    console.log(`📝 Posts: 0 (omitidos por configuración)`);

    console.log('\n🔐 Credenciales de desarrollo:');
    console.log('Admin: admin@eventconnect.com / admin123');
    console.log('Usuario: maria@example.com / dev123');
    console.log('Usuario: carlos@example.com / dev123');
    console.log('Usuario: ana@example.com / dev123');
  } catch (error) {
    console.error('❌ Error en seed de desarrollo:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const { database } = require('../../config');

  mongoose
    .connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/eventconnect'
    )
    .then(() => {
      console.log('📊 Conectado a MongoDB');
      return seedDevelopmentData();
    })
    .then(() => {
      console.log('✅ Seed completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { seedDevelopmentData, DEV_USERS, DEV_EVENTS, DEV_TRIBES };
