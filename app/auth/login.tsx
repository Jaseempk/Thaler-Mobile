import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
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

  const privyHook = usePrivy();
  const { user, authenticated } = privyHook as unknown as UsePrivy;
  const {
    sendCode,
    loginWithCode,
    state: { status },
  } = useLoginWithEmail();
  const { login } = useLoginWithOAuth();

  // If user is already authenticated, redirect to tabs
  React.useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      router.replace("/tabs");
    }
  }, [authenticated, user]);

  const handleSendCode = async () => {
    try {
      await sendCode({ email });
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
    try {
      await loginWithCode({ code, email });
    } catch (error) {
      console.error("Failed to login:", error);
      Alert.alert("Error", "Failed to verify code. Please try again.");
    }
  };

  const handleSignUp = () => {
    router.push("/auth/welcome");
  };

  if (status === "sending-code" || status === "submitting-code") {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading...</Text>
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
              onPress={() => login({ provider: "google" })}
              variant="outline"
              size="large"
              style={styles.socialButton}
              icon={<Text style={styles.socialIcon}>G</Text>}
            />

            <Button
              title="Continue with Apple"
              onPress={() => login({ provider: "apple" })}
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
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: Colors.light.primary,
    fontWeight: "bold",
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
