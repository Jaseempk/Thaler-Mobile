import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "../../constants/Colors";

interface TokenBalanceCardSkeletonProps {
  theme: "light" | "dark";
}

const TokenBalanceCardSkeleton: React.FC<TokenBalanceCardSkeletonProps> = ({
  theme,
}) => {
  // Animation for the shimmer effect
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      })
    );
    
    shimmerAnimation.start();
    
    return () => {
      shimmerAnimation.stop();
    };
  }, []);

  // Create the shimmer gradient interpolation
  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme === "dark" ? ["#2C3E50", "#34495E"] : ["#E0E0E0", "#F5F5F5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.contentContainer}>
          <View style={styles.leftSection}>
            <View style={styles.logoContainer}>
              <Animated.View
                style={[
                  styles.shimmerOverlay,
                  {
                    transform: [{ translateX: shimmerTranslate }],
                    backgroundColor: theme === "dark" 
                      ? "rgba(255, 255, 255, 0.1)" 
                      : "rgba(255, 255, 255, 0.5)",
                  },
                ]}
              />
            </View>
            <View style={styles.nameContainer}>
              <View style={[styles.shimmerLine, { width: 60, height: 18, marginBottom: 6 }]}>
                <Animated.View
                  style={[
                    styles.shimmerOverlay,
                    {
                      transform: [{ translateX: shimmerTranslate }],
                      backgroundColor: theme === "dark" 
                        ? "rgba(255, 255, 255, 0.1)" 
                        : "rgba(255, 255, 255, 0.5)",
                    },
                  ]}
                />
              </View>
              <View style={[styles.shimmerLine, { width: 100, height: 14 }]}>
                <Animated.View
                  style={[
                    styles.shimmerOverlay,
                    {
                      transform: [{ translateX: shimmerTranslate }],
                      backgroundColor: theme === "dark" 
                        ? "rgba(255, 255, 255, 0.1)" 
                        : "rgba(255, 255, 255, 0.5)",
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          <View style={styles.rightSection}>
            <View style={[styles.shimmerLine, { width: 80, height: 18, marginBottom: 6, alignSelf: 'flex-end' }]}>
              <Animated.View
                style={[
                  styles.shimmerOverlay,
                  {
                    transform: [{ translateX: shimmerTranslate }],
                    backgroundColor: theme === "dark" 
                      ? "rgba(255, 255, 255, 0.1)" 
                      : "rgba(255, 255, 255, 0.5)",
                  },
                ]}
              />
            </View>
            <View style={styles.valueContainer}>
              <View style={[styles.shimmerLine, { width: 60, height: 14, marginRight: 8 }]}>
                <Animated.View
                  style={[
                    styles.shimmerOverlay,
                    {
                      transform: [{ translateX: shimmerTranslate }],
                      backgroundColor: theme === "dark" 
                        ? "rgba(255, 255, 255, 0.1)" 
                        : "rgba(255, 255, 255, 0.5)",
                    },
                  ]}
                />
              </View>
              <View style={[styles.changeContainer, { width: 50, height: 20 }]}>
                <Animated.View
                  style={[
                    styles.shimmerOverlay,
                    {
                      transform: [{ translateX: shimmerTranslate }],
                      backgroundColor: theme === "dark" 
                        ? "rgba(255, 255, 255, 0.1)" 
                        : "rgba(255, 255, 255, 0.5)",
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  gradientBackground: {
    borderRadius: 16,
  },
  contentContainer: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rightSection: {
    alignItems: "flex-end",
    flex: 1,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
    position: "relative",
  },
  nameContainer: {
    justifyContent: "center",
  },
  shimmerLine: {
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    overflow: "hidden",
    position: "relative",
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  changeContainer: {
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    overflow: "hidden",
    position: "relative",
  },
});

export default TokenBalanceCardSkeleton;
