import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useColorScheme, View, Text } from 'react-native';
import Colors from '../constants/Colors';
import Config from '../constants/Config';
import { PrivyProvider, PrivyElements } from '@privy-io/expo';

export default function RootLayout() {
  console.log('RootLayout - Mounting with config:', {
    appId: Config.PRIVY.APP_ID,
    clientId: Config.PRIVY.CLIENT_ID,
  });

  const colorScheme = useColorScheme();
  
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold
  });

  if (!fontsLoaded) {
    console.log('RootLayout - Waiting for fonts to load');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <PrivyProvider 
      appId={Config.PRIVY.APP_ID} 
      clientId={Config.PRIVY.CLIENT_ID}
    >
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colorScheme === 'dark' ? Colors.dark.background : Colors.light.background,
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/welcome" options={{ headerShown: false }} />
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
      </Stack>
      <PrivyElements />
    </PrivyProvider>
  );
}
