import React, { useEffect, ReactNode } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useColorScheme, View, Text } from "react-native";
import Colors from "../constants/Colors";
import Config from "../constants/Config";
import { PrivyProvider, PrivyElements, usePrivy } from "@privy-io/expo";
import { UsePrivy } from "../types/privy";
// import { Slot } from "expo-router";

// Wrapper component to log Privy state
function PrivyLogger({ children }: { children: ReactNode }) {
  const privyState = usePrivy() as unknown as UsePrivy;

  useEffect(() => {
    console.log("PrivyLogger - Initial Mount:", {
      privyStateKeys: Object.keys(privyState),
      ready: privyState.isReady,

      hasUser: !!privyState.user,
      rawPrivyState: privyState,
      timestamp: new Date().toISOString(),
    });
  }, []);

  useEffect(() => {
    console.log("PrivyLogger - State Update:", {
      ready: privyState.isReady,

      hasUser: !!privyState.user,
      rawPrivyState: privyState,
      timestamp: new Date().toISOString(),
    });
  }, [privyState.isReady, privyState.user]);

  return <>{children}</>;
}

export default function RootLayout() {
  console.log("RootLayout - Start Mount:", {
    timestamp: new Date().toISOString(),
  });

  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    console.log("RootLayout - Fonts Status:", {
      fontsLoaded,
      timestamp: new Date().toISOString(),
    });
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    console.log("RootLayout - Waiting for fonts");
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading fonts...</Text>
      </View>
    );
  }

  console.log("RootLayout - Rendering with config:", {
    appId: Config.PRIVY.APP_ID,
    clientId: Config.PRIVY.CLIENT_ID,
    timestamp: new Date().toISOString(),
  });

  return (
    <PrivyProvider
      appId={Config.PRIVY.APP_ID}
      clientId={Config.PRIVY.CLIENT_ID}
    >
      <PrivyLogger>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor:
                colorScheme === "dark"
                  ? Colors.dark.background
                  : Colors.light.background,
            },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/welcome" options={{ headerShown: false }} />
          <Stack.Screen name="tabs" options={{ headerShown: false }} />
        </Stack>
        <PrivyElements />
      </PrivyLogger>
    </PrivyProvider>
  );
}
