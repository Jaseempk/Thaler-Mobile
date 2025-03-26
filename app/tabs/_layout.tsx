import { Tabs } from 'expo-router';
import Colors from '../../constants/Colors';
import { AuthBoundary } from '../../components/AuthBoundary';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export default function TabLayout() {
  const { activeTheme } = useTheme();

  return (
    <AuthBoundary>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[activeTheme].tint,
          tabBarStyle: {
            backgroundColor: Colors[activeTheme].background,
            borderTopColor: Colors[activeTheme].border,
          },
          tabBarInactiveTintColor: Colors[activeTheme].tabIconDefault,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="savings"
          options={{
            title: 'Savings',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </AuthBoundary>
  );
}
