import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Button from "../../components/common/Button";
import Colors from "../../constants/Colors";
import { usePrivy, useLoginWithEmail, useLoginWithOAuth } from "@privy-io/expo";
import { UsePrivy, UseLoginWithOAuth } from "../../types/privy";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const [loadingDots, setLoadingDots] = useState("");

  // const privyHook = usePrivy();
  const { user, isReady } = usePrivy();

  console.log("Login Screen - Initial render:", {
    isReady,
    user,
  });

  // **Move hooks to the top level**
  const emailHook = useLoginWithEmail();
  const oAuthHook = useLoginWithOAuth({
    onSuccess: (user) => {
      console.log("OAuth login successful", user);
      router.replace("/tabs");
    },
    onError: (error) => {
      console.error("OAuth login failed:", error);
      Alert.alert(
        "Error",
        "Failed to login with social provider. Please try again."
      );
    },
  });

  // Only initialize these hooks if Privy is isReady
  const loginHooks = React.useMemo(() => {
    if (!isReady) return null;

    console.log("Login Screen - Initializing login hooks");

    return {
      sendCode: emailHook.sendCode,
      loginWithCode: emailHook.loginWithCode,
      status: emailHook.state.status,
      loginWithOAuth: (oAuthHook as unknown as UseLoginWithOAuth)
        .loginWithOAuth,
    };
  }, [isReady]);

  // If user is already authenticated, redirect to tabs
  React.useEffect(() => {
    if (isReady && user) {
      console.log("Login Screen - User authenticated, redirecting to tabs", {
        isReady,
        user,
        userExists: !!user,
        userType: typeof user,
      });

      // Add a null check before accessing any properties
      if (user && Object.keys(user).length > 0) {
        router.replace("/tabs");
      }
    }
  }, [isReady, user, router]);
  // Pulse animation
  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulse).start();
  }, []);

  // Loading dots animation
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingDots((dots) => (dots.length >= 3 ? "" : dots + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleSendCode = async () => {
    if (!loginHooks) return;

    try {
      console.log("Login Screen - Sending code to:", email);
      await loginHooks.sendCode({ email });
      setCodeSent(true);
    } catch (error) {
      console.error("Failed to send code:", error);
      Alert.alert(
        "Error",
        "Failed to send verification code. Please try again."
      );
    }
  };

  const handleLogin = async () => {
    if (!loginHooks) return;

    try {
      console.log("Login Screen - Verifying code for:", email);
      await loginHooks.loginWithCode({ code, email });
      router.replace("/tabs");
    } catch (error) {
      console.error("Failed to login:", error);
      Alert.alert("Error", "Failed to verify code. Please try again.");
    }
  };

  const handleSignUp = () => {
    router.push("/auth/welcome");
  };

  if (!isReady || !loginHooks) {
    console.log("Login Screen - Waiting for Privy initialization");
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <StatusBar style="dark" />
        <View style={styles.loadingContent}>
          <Animated.View
            style={[styles.logoSquare, { transform: [{ scale: pulseAnim }] }]}
          />
          <Text style={styles.loadingText}>Initializing{loadingDots}</Text>
          <Text style={styles.loadingSubtext}>
            Setting up your secure environment
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (
    loginHooks.status === "sending-code" ||
    loginHooks.status === "submitting-code"
  ) {
    console.log("Login Screen - Processing auth action:", loginHooks.status);
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Processing...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Welcome Back</Text>

        <Text style={styles.subtitle}>
          Sign in to continue managing your savings
        </Text>

        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={Colors.light.gray}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!codeSent}
          />

          {codeSent && (
            <TextInput
              style={styles.input}
              placeholder="Enter verification code"
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
            />
          )}

          {!codeSent ? (
            <Button
              title="Send Code"
              onPress={handleSendCode}
              variant="primary"
              size="large"
              style={styles.loginButton}
              textStyle={styles.loginButtonText}
            />
          ) : (
            <Button
              title="Verify Code"
              onPress={handleLogin}
              variant="primary"
              size="large"
              style={styles.loginButton}
              textStyle={styles.loginButtonText}
            />
          )}

          <View style={styles.socialLoginContainer}>
            <Button
              title="Continue with Google"
              onPress={() => loginHooks.loginWithOAuth({ provider: "google" })}
              variant="outline"
              size="large"
              style={styles.socialButton}
              icon={<Text style={styles.socialIcon}>G</Text>}
            />

            <Button
              title="Continue with Apple"
              onPress={() => loginHooks.loginWithOAuth({ provider: "apple" })}
              variant="outline"
              size="large"
              style={styles.socialButton}
              icon={<Text style={styles.socialIcon}>A</Text>}
            />
          </View>
        </View>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account?</Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.signupButton}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#CBFF9B", // Matching welcome screen theme
  },
  loadingContent: {
    alignItems: "center",
  },
  logoSquare: {
    width: 60,
    height: 60,
    backgroundColor: "#1B381F",
    borderRadius: 12,
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 24,
    color: "#1B381F",
    fontWeight: "700",
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 16,
    color: "#2D5531",
    textAlign: "center",
    maxWidth: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    padding: 16,
  },
  backButton: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.light.primary,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 48,
    lineHeight: 24,
  },
  formContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    fontSize: 16,
    color: Colors.light.text,
  },
  loginButton: {
    backgroundColor: Colors.light.primary,
    marginBottom: 24,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  socialLoginContainer: {
    marginBottom: 24,
  },
  socialButton: {
    marginBottom: 12,
    borderColor: Colors.light.border,
  },
  socialIcon: {
    fontSize: 16,
    fontWeight: "bold",
    width: 24,
    height: 24,
    textAlign: "center",
    lineHeight: 24,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  signupButton: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.light.primary,
    marginLeft: 4,
  },
});
