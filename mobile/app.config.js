// Expo app configuration reading environment variables
export default ({ config }) => ({
  ...config,
  name: config.name || 'EventConnect',
  slug: config.slug || 'eventconnect',
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000',
    appEnv: process.env.EXPO_PUBLIC_APP_ENV || 'development',
  },
});