import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Contexts
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/auth/ResetPasswordScreen';

import HomeScreen from './src/screens/main/HomeScreen';
import EventsScreen from './src/screens/main/EventsScreen';
import TribesScreen from './src/screens/main/TribesScreen';
import ProfileScreen from './src/screens/main/ProfileScreen';
import NotificationsScreen from './src/screens/main/NotificationsScreen';

import EventDetailScreen from './src/screens/events/EventDetailScreen';
import CreateEventScreen from './src/screens/events/CreateEventScreen';
import EditEventScreen from './src/screens/events/EditEventScreen';

import TribeDetailScreen from './src/screens/tribes/TribeDetailScreen';
import CreateTribeScreen from './src/screens/tribes/CreateTribeScreen';
import EditTribeScreen from './src/screens/tribes/EditTribeScreen';

import UserProfileScreen from './src/screens/users/UserProfileScreen';
import SettingsScreen from './src/screens/users/SettingsScreen';
import SearchScreen from './src/screens/main/SearchScreen';

// Components
import LoadingScreen from './src/components/ui/LoadingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Crear cliente de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

// Stack de autenticación
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}

// Tab Navigator principal
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Events') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Tribes') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen 
        name="Events" 
        component={EventsScreen}
        options={{ title: 'Eventos' }}
      />
      <Tab.Screen 
        name="Tribes" 
        component={TribesScreen}
        options={{ title: 'Tribus' }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{ title: 'Buscar' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

// Stack principal de la aplicación
function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      
      {/* Eventos */}
      <Stack.Screen 
        name="EventDetail" 
        component={EventDetailScreen}
        options={{ headerShown: true, title: 'Detalle del Evento' }}
      />
      <Stack.Screen 
        name="CreateEvent" 
        component={CreateEventScreen}
        options={{ headerShown: true, title: 'Crear Evento' }}
      />
      <Stack.Screen 
        name="EditEvent" 
        component={EditEventScreen}
        options={{ headerShown: true, title: 'Editar Evento' }}
      />
      
      {/* Tribus */}
      <Stack.Screen 
        name="TribeDetail" 
        component={TribeDetailScreen}
        options={{ headerShown: true, title: 'Detalle de la Tribu' }}
      />
      <Stack.Screen 
        name="CreateTribe" 
        component={CreateTribeScreen}
        options={{ headerShown: true, title: 'Crear Tribu' }}
      />
      <Stack.Screen 
        name="EditTribe" 
        component={EditTribeScreen}
        options={{ headerShown: true, title: 'Editar Tribu' }}
      />
      
      {/* Usuarios */}
      <Stack.Screen 
        name="UserProfile" 
        component={UserProfileScreen}
        options={{ headerShown: true, title: 'Perfil de Usuario' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ headerShown: true, title: 'Configuración' }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ headerShown: true, title: 'Notificaciones' }}
      />
    </Stack.Navigator>
  );
}

// Componente principal de navegación
function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

// Componente principal de la aplicación
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="auto" />
        <Navigation />
      </AuthProvider>
    </QueryClientProvider>
  );
}