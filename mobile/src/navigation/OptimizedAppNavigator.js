import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, StatusBar, Platform } from 'react-native';
import { 
  Home,
  Calendar,
  Search,
  Users,
  Bell,
  MessageCircle,
  User,
  Settings,
  Compass,
  Heart,
  BookOpen
} from 'lucide-react-native';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/main/HomeScreen';
import EventsScreen from '../screens/main/EventsScreen';
import EventDetailScreen from '../screens/main/EventDetailScreen';
import TribesScreen from '../screens/main/TribesScreen';
import TribeDetailScreen from '../screens/main/TribeDetailScreen';
import ChatScreen from '../screens/main/ChatScreen';
import ChatDetailScreen from '../screens/main/ChatDetailScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import UserProfileScreen from '../screens/main/UserProfileScreen';
import SearchScreen from '../screens/SearchScreen';
import MapScreen from '../screens/main/MapScreen';

// Context
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// Navegadores
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Configuración de tema
const getTabBarStyle = (isDarkMode) => ({
  backgroundColor: isDarkMode ? '#1a1a2e' : '#ffffff',
  borderTopColor: isDarkMode ? '#2a2a3e' : '#e5e7eb',
  borderTopWidth: 1,
  paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  paddingTop: 10,
  height: Platform.OS === 'ios' ? 85 : 65,
  elevation: 8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
});

const getTabBarIcon = (routeName, focused, isDarkMode) => {
  const color = focused 
    ? '#67e8f9' 
    : isDarkMode ? '#9ca3af' : '#6b7280';
  
  const size = focused ? 26 : 22;
  
  const icons = {
    Home: Home,
    Events: Calendar,
    Explore: Compass,
    Tribes: Users,
    Profile: User,
  };
  
  const IconComponent = icons[routeName];
  return IconComponent ? <IconComponent size={size} color={color} /> : null;
};

// Stack Navigator para Autenticación
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      gestureEnabled: true,
      gestureDirection: 'horizontal',
      cardStyleInterpolator: ({ current, layouts }) => ({
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
          ],
        },
      }),
    }}
  >
    <Stack.Screen 
      name="Login" 
      component={LoginScreen}
      options={{
        animationTypeForReplace: 'push',
      }}
    />
    <Stack.Screen 
      name="Register" 
      component={RegisterScreen}
      options={{
        animationTypeForReplace: 'push',
      }}
    />
  </Stack.Navigator>
);

// Stack Navigator para Home
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      gestureEnabled: true,
    }}
  >
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen 
      name="EventDetail" 
      component={EventDetailScreen}
      options={{
        presentation: 'modal',
        gestureDirection: 'vertical',
      }}
    />
    <Stack.Screen 
      name="TribeDetail" 
      component={TribeDetailScreen}
      options={{
        presentation: 'modal',
        gestureDirection: 'vertical',
      }}
    />
    <Stack.Screen 
      name="ChatDetail" 
      component={ChatDetailScreen}
      options={{
        presentation: 'card',
        gestureDirection: 'horizontal',
      }}
    />
  </Stack.Navigator>
);

// Stack Navigator para Events
const EventsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      gestureEnabled: true,
    }}
  >
    <Stack.Screen name="EventsMain" component={EventsScreen} />
    <Stack.Screen 
      name="EventDetail" 
      component={EventDetailScreen}
      options={{
        presentation: 'modal',
        gestureDirection: 'vertical',
      }}
    />
    <Stack.Screen 
      name="MapView" 
      component={MapScreen}
      options={{
        presentation: 'fullScreenModal',
      }}
    />
  </Stack.Navigator>
);

// Stack Navigator para Explore
const ExploreStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      gestureEnabled: true,
    }}
  >
    <Stack.Screen name="SearchMain" component={SearchScreen} />
    <Stack.Screen name="EventDetail" component={EventDetailScreen} />
    <Stack.Screen name="TribeDetail" component={TribeDetailScreen} />
    <Stack.Screen name="UserProfile" component={UserProfileScreen} />
  </Stack.Navigator>
);

// Stack Navigator para Tribes
const TribesStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      gestureEnabled: true,
    }}
  >
    <Stack.Screen name="TribesMain" component={TribesScreen} />
    <Stack.Screen 
      name="TribeDetail" 
      component={TribeDetailScreen}
      options={{
        presentation: 'modal',
        gestureDirection: 'vertical',
      }}
    />
    <Stack.Screen 
      name="ChatDetail" 
      component={ChatDetailScreen}
      options={{
        presentation: 'card',
        gestureDirection: 'horizontal',
      }}
    />
  </Stack.Navigator>
);

// Stack Navigator para Profile
const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      gestureEnabled: true,
    }}
  >
    <Stack.Screen name="ProfileMain" component={UserProfileScreen} />
    <Stack.Screen name="Settings" component={NotificationsScreen} />
    <Stack.Screen name="EventDetail" component={EventDetailScreen} />
  </Stack.Navigator>
);

// Tab Navigator Principal
const MainTabs = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => getTabBarIcon(route.name, focused, isDarkMode),
        tabBarStyle: getTabBarStyle(isDarkMode),
        tabBarActiveTintColor: '#67e8f9',
        tabBarInactiveTintColor: isDarkMode ? '#9ca3af' : '#6b7280',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: -5,
        },
        tabBarHideOnKeyboard: true,
        // Animaciones mejoradas para las tabs
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        // Optimización de performance
        lazy: true,
        unmountOnBlur: false,
      })}
      initialRouteName="Home"
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{
          tabBarLabel: 'Inicio',
          tabBarTestID: 'home-tab',
        }}
      />
      <Tab.Screen 
        name="Events" 
        component={EventsStack}
        options={{
          tabBarLabel: 'Eventos',
          tabBarTestID: 'events-tab',
        }}
      />
      <Tab.Screen 
        name="Explore" 
        component={ExploreStack}
        options={{
          tabBarLabel: 'Explorar',
          tabBarTestID: 'explore-tab',
        }}
      />
      <Tab.Screen 
        name="Tribes" 
        component={TribesStack}
        options={{
          tabBarLabel: 'Tribus',
          tabBarTestID: 'tribes-tab',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{
          tabBarLabel: 'Perfil',
          tabBarTestID: 'profile-tab',
        }}
      />
    </Tab.Navigator>
  );
};

// Drawer Navigator (opcional para funciones adicionales)
const DrawerNavigator = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: isDarkMode ? '#1a1a2e' : '#ffffff',
          width: 280,
        },
        drawerActiveTintColor: '#67e8f9',
        drawerInactiveTintColor: isDarkMode ? '#9ca3af' : '#6b7280',
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
          marginLeft: -10,
        },
        drawerItemStyle: {
          marginVertical: 2,
          borderRadius: 8,
        },
        drawerActiveBackgroundColor: isDarkMode ? '#67e8f920' : '#67e8f910',
        // Swipe desde el borde para abrir
        swipeEnabled: true,
        swipeEdgeWidth: 50,
      }}
    >
      <Drawer.Screen 
        name="MainTabs" 
        component={MainTabs}
        options={{
          drawerLabel: 'Inicio',
          drawerIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          drawerLabel: 'Notificaciones',
          drawerIcon: ({ color, size }) => <Bell size={size} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{
          drawerLabel: 'Mensajes',
          drawerIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={NotificationsScreen}
        options={{
          drawerLabel: 'Configuración',
          drawerIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
};

// Configuración de navegación principal
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDarkMode } = useTheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simular tiempo de carga inicial
    const timer = setTimeout(() => setIsReady(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !isReady) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: isDarkMode ? '#0a0a0a' : '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {/* Aquí podrías poner un splash screen */}
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: isDarkMode,
        colors: {
          primary: '#67e8f9',
          background: isDarkMode ? '#0a0a0a' : '#ffffff',
          card: isDarkMode ? '#1a1a2e' : '#ffffff',
          text: isDarkMode ? '#ffffff' : '#000000',
          border: isDarkMode ? '#2a2a3e' : '#e5e7eb',
          notification: '#ef4444',
        },
      }}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#0a0a0a' : '#ffffff'}
        translucent={false}
      />
      
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardStyleInterpolator: ({ current, layouts }) => ({
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          }),
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen 
            name="Main" 
            component={DrawerNavigator}
            options={{ animationTypeForReplace: 'push' }}
          />
        ) : (
          <Stack.Screen 
            name="Auth" 
            component={AuthStack}
            options={{ animationTypeForReplace: 'pop' }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;


