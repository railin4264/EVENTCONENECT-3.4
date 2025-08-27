import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { ToastProvider } from 'react-native-toast-message';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import EventsScreen from './src/screens/EventsScreen';
import TribesScreen from './src/screens/TribesScreen';
import PostsScreen from './src/screens/PostsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SearchScreen from './src/screens/SearchScreen';
import AuthScreen from './src/screens/AuthScreen';
import EventDetailScreen from './src/screens/EventDetailScreen';
import TribeDetailScreen from './src/screens/TribeDetailScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';
import CreateEventScreen from './src/screens/CreateEventScreen';
import CreateTribeScreen from './src/screens/CreateTribeScreen';
import CreatePostScreen from './src/screens/CreatePostScreen';
import ChatScreen from './src/screens/ChatScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import GamificationScreen from './src/screens/GamificationScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';

// Context
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';

// Services
import { apiClient } from './src/services/apiClient';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function TabNavigator() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Events') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Tribes') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Posts') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Inicio',
          tabBarLabel: 'Inicio',
        }}
      />
      <Tab.Screen 
        name="Events" 
        component={EventsScreen}
        options={{
          title: 'Eventos',
          tabBarLabel: 'Eventos',
        }}
      />
      <Tab.Screen 
        name="Tribes" 
        component={TribesScreen}
        options={{
          title: 'Tribus',
          tabBarLabel: 'Tribus',
        }}
      />
      <Tab.Screen 
        name="Posts" 
        component={PostsScreen}
        options={{
          title: 'Posts',
          tabBarLabel: 'Posts',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3B82F6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {user ? (
        <>
          <Stack.Screen 
            name="Main" 
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Search" 
            component={SearchScreen}
            options={{ title: 'Búsqueda' }}
          />
          <Stack.Screen 
            name="EventDetail" 
            component={EventDetailScreen}
            options={{ title: 'Detalle del Evento' }}
          />
          <Stack.Screen 
            name="TribeDetail" 
            component={TribeDetailScreen}
            options={{ title: 'Detalle de la Tribu' }}
          />
          <Stack.Screen 
            name="PostDetail" 
            component={PostDetailScreen}
            options={{ title: 'Detalle del Post' }}
          />
          <Stack.Screen 
            name="UserProfile" 
            component={UserProfileScreen}
            options={{ title: 'Perfil de Usuario' }}
          />
          <Stack.Screen 
            name="CreateEvent" 
            component={CreateEventScreen}
            options={{ title: 'Crear Evento' }}
          />
          <Stack.Screen 
            name="CreateTribe" 
            component={CreateTribeScreen}
            options={{ title: 'Crear Tribu' }}
          />
          <Stack.Screen 
            name="CreatePost" 
            component={CreatePostScreen}
            options={{ title: 'Crear Post' }}
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{ title: 'Chat' }}
          />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationsScreen}
            options={{ title: 'Notificaciones' }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ title: 'Configuración' }}
          />
          <Stack.Screen 
            name="Gamification" 
            component={GamificationScreen}
            options={{ title: 'Gamificación' }}
          />
          <Stack.Screen 
            name="Analytics" 
            component={AnalyticsScreen}
            options={{ title: 'Analytics' }}
          />
        </>
      ) : (
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <ToastProvider />
              <AppNavigator />
            </NavigationContainer>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}