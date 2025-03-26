import React from "react";
import { View, Text, StyleSheet, SafeAreaView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Button from "../../components/common/Button";
import Colors from "../../constants/Colors";
import { usePrivy } from "@privy-io/expo";
import { UsePrivy } from "../../types/privy";
import Config from "../../constants/Config";
import * as Updates from "expo-updates";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  // const privyHook = usePrivy() as unknown as UsePrivy;
  const { isReady, user } = usePrivy();
  const [initTimeout, setInitTimeout] = React.useState(false);

  // Log state for debugging
  React.useEffect(() => {
    console.log("Welcome Screen - State Update:", {
      isReady,
      hasUser: !!user,
      hasWallet: user !== null,
      config: {
        appId: Config.PRIVY.APP_ID,
        clientId: Config.PRIVY.CLIENT_ID,
      },
    });
  }, [isReady, user]);

  // Handle initialization timeout
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isReady) {
        setInitTimeout(true);
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timeoutId);
  }, [isReady]);

  // Handle authenticated users
  React.useEffect(() => {
    console.log("Welcome Screen - Auth Check:", {
      isReady,
      hasUser: !!user,
      user: user ? user.id : null,
      timestamp: new Date().toISOString(),
    });
    
    if (isReady && user !== null) {
      console.log("Welcome Screen - User authenticated, redirecting to tabs");
      
      try {
        // Use immediate navigation with push instead of replace
        router.push("/tabs");
      } catch (error) {
        console.error("Navigation error:", error);
      }
    }
  }, [isReady, user, router]);

  // Handle retry
  const handleRetry = async () => {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error("Failed to reload app:", error);
      // If reload fails, reset the timeout and let it try again
      setInitTimeout(false);
    }
  };

  const handleGetStarted = () => {
    console.log("Welcome Screen - Get Started clicked");
    router.push("/auth/login");
  };

  // Show loading during initial SDK initialization
  if (!isReady) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        {initTimeout ? (
          <>
            <Text style={styles.loadingText}>
              Taking longer than expected...
            </Text>
            <Text style={styles.loadingDetail}>
              Please check your internet connection
            </Text>
            <Button
              title="Retry"
              onPress={handleRetry}
              variant="secondary"
              size="medium"
              style={styles.retryButton}
            />
          </>
        ) : (
          <>
            <Text style={styles.loadingText}>Initializing Privy...</Text>
            <Text style={styles.loadingDetail}>
              This may take a few moments
            </Text>
          </>
        )}
      </SafeAreaView>
    );
  }

  // Once isReady, show welcome screen for non-authenticated users
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <View style={styles.logoSquare} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>
            Secure{"\n"}Wallet{"\n"}Management
          </Text>
          <Text style={styles.subtitle}>
            Experience secure and private crypto wallet management with seamless
            transactions and real-time balance tracking
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            variant="primary"
            size="large"
            style={styles.getStartedButton}
            textStyle={styles.getStartedButtonText}
          />
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have a wallet? </Text>
            <Text
              style={styles.loginLink}
              onPress={() => router.push("/auth/login")}
            >
              Connect
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#CBFF9B", // Light lime green background
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  logoContainer: {
    alignItems: "flex-start",
    marginBottom: 48,
  },
  logoSquare: {
    width: 40,
    height: 40,
    backgroundColor: "#1B381F", // Dark green for the square logo
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: width * 0.12, // Responsive font size
    fontWeight: "700",
    color: "#1B381F", // Dark green
    lineHeight: width * 0.13, // Slightly larger than fontSize for good spacing
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#2D5531", // Slightly lighter green for subtitle
    lineHeight: 24,
    maxWidth: "90%",
  },
  buttonContainer: {
    marginTop: 48,
  },
  getStartedButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#1B381F", // Dark green button
    borderRadius: 12,
  },
  getStartedButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  loginText: {
    fontSize: 16,
    color: "#2D5531",
  },
  loginLink: {
    fontSize: 16,
    color: "#1B381F",
    fontWeight: "600",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: Colors.light.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  loadingDetail: {
    color: Colors.light.gray,
    fontSize: 14,
  },
  errorText: {
    color: Colors.light.error || "#ff0000",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  errorDetail: {
    color: Colors.light.gray,
    fontSize: 14,
    marginBottom: 24,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
  },
});
