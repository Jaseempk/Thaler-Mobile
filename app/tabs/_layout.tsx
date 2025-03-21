import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import Colors from '../../constants/Colors';
import { AuthBoundary } from '../../components/AuthBoundary';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthBoundary>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="savings"
          options={{
            title: 'Savings',
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Analytics',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
          }}
        />
      </Tabs>
    </AuthBoundary>
  );
}
