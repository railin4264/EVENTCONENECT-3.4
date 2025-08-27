import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Resolve base host for API and Socket
const resolveBaseHost = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');

  // On Android emulator, localhost maps to host 10.0.2.2
  if (Platform.OS === 'android') return 'http://10.0.2.2:5000';

  // Default for iOS simulator/web/dev
  return 'http://localhost:5000';
};

const baseHost = resolveBaseHost();
const apiBaseURL = `${baseHost}/api`;

// Create axios instance
const apiClient = axios.create({
  baseURL: apiBaseURL,
  timeout: 15000,
});

// Attach Authorization header from secure storage if present
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {
    // ignore
  }
  return config;
});

export const API_BASE_URL = apiBaseURL;
export const SOCKET_BASE_URL = baseHost; // socket.io server base (no /api)
export default apiClient;










