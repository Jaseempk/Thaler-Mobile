import React, { useEffect, ReactNode } from "react";
import { Stack } from "expo-router";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { View, Text, useColorScheme } from "react-native";
import Colors from "../constants/Colors";
import Config from "../constants/Config";
import { PrivyProvider, PrivyElements, usePrivy } from "@privy-io/expo";
import { UsePrivy } from "../types/privy";
import { ThemeProvider } from "../contexts/ThemeContext";
import { WalletProvider } from "../context/WalletContext";
import { SavingsPoolProvider } from "../context/SavingsPoolContext";
import ThemedStatusBar from "../components/ui/ThemedStatusBar";
import {
  base,
  baseSepolia,
  mainnet,
  sepolia,
  polygon,
  polygonMumbai,
} from "viem/chains";

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

  // colorScheme is now managed by ThemeContext

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
      config={{
        embedded: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
      supportedChains={[
        baseSepolia,
        // base,
        // mainnet,
        // sepolia,
        // polygon,
        // polygonMumbai,
      ]}
    >
      <ThemeProvider>
        <WalletProvider>
          <SavingsPoolProvider>
            <PrivyLogger>
              <ThemedStatusBar />
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen
                  name="auth/welcome"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="tabs" options={{ headerShown: false }} />
              </Stack>
              <PrivyElements />
            </PrivyLogger>
          </SavingsPoolProvider>
        </WalletProvider>
      </ThemeProvider>
    </PrivyProvider>
  );
}
