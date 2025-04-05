import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import { useTheme } from "../../contexts/ThemeContext";
import TokenLogo from "../ui/TokenLogo";
import { shadows, layouts } from "../../styles/common";

/**
 * Unified token interface that can handle all token data needs
 */
interface TokenData {
  symbol: string;
  name?: string;
  balance: string;
  value?: string;
  price?: number;
  change?: string;
  isPositive?: boolean;
  logo: any;
  address?: string;
  gradientColors?: readonly [string, string, ...string[]];
}

/**
 * Unified TokenBalanceCard props
 */
interface TokenBalanceCardProps {
  token: TokenData;
  variant?: 'default' | 'compact' | 'create';
  theme?: "light" | "dark";
  onPress?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

/**
 * A unified TokenBalanceCard component that can be used in different contexts
 * with various display options based on the variant prop
 */
const TokenBalanceCard: React.FC<TokenBalanceCardProps> = ({
  token,
  variant = 'default',
  theme: propTheme,
  onPress,
  onRefresh,
  isLoading = false,
}) => {
  const { activeTheme } = useTheme();
  const theme = propTheme || activeTheme;
  
  // Calculate USD value if price is provided but value isn't
  const usdValue = token.value || (token.price && token.balance 
    ? `$${(parseFloat(token.balance) * token.price).toFixed(2)}`
    : undefined);

  // Default gradient colors if not provided
  const gradientColors = token.gradientColors || 
    (token.symbol === 'ETH' 
      ? ['#6B8AFF', '#454A75'] as [string, string]
      : token.symbol === 'USDC'
        ? ['#2775CA', '#1652A0'] as [string, string]
        : ['#6B8AFF', '#454A75'] as [string, string]);

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
      borderRadius: 16,
      overflow: "hidden",
      ...shadows.card,
    },
    gradientBackground: {
      borderRadius: 16,
    },
    contentContainer: {
      padding: variant === 'compact' ? 12 : 16,
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
      width: variant === 'compact' ? 36 : 48,
      height: variant === 'compact' ? 36 : 48,
      borderRadius: variant === 'compact' ? 18 : 24,
      backgroundColor: "rgba(70, 70, 90, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      padding: 0,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.4)",
      ...shadows.subtle,
    },
    tokenLogo: {
      width: variant === 'compact' ? 30 : 40,
      height: variant === 'compact' ? 30 : 40,
      resizeMode: "contain",
    },
    tokenInfo: {
      flex: 1,
    },
    tokenSymbol: {
      fontSize: variant === 'compact' ? 16 : 18,
      fontWeight: "700",
      color: "#FFFFFF",
      marginBottom: 2,
    },
    tokenName: {
      fontSize: variant === 'compact' ? 12 : 14,
      color: "rgba(255, 255, 255, 0.8)",
    },
    changeContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 12,
    },
    changeText: {
      fontSize: 10,
      fontWeight: "600",
      marginLeft: 2,
    },
    refreshButton: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      justifyContent: "center",
      alignItems: "center",
    },
    // Create variant specific styles
    createContainer: {
      backgroundColor: Colors[theme].secondaryLight,
      borderRadius: 16,
      padding: 16,
      marginTop: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: Colors[theme].border,
      overflow: 'hidden',
    },
    createGradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.05,
    },
    createHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    createIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    createSymbol: {
      fontSize: 16,
      fontWeight: '700',
      color: Colors[theme].text,
    },
    createBalanceContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    createBalanceLabel: {
      fontSize: 14,
      color: Colors[theme].textSecondary,
    },
    createBalanceValue: {
      fontSize: 18,
      fontWeight: '700',
      color: Colors[theme].text,
    },
    createUsdContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    createUsdLabel: {
      fontSize: 14,
      color: Colors[theme].textSecondary,
    },
    createUsdValue: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors[theme].textSecondary,
    },
    // Original TokenBalanceCard styles for home screen
    nameContainer: {
      justifyContent: "center",
    },
    tokenBalance: {
      fontSize: 18,
      fontWeight: "700",
      color: "#FFFFFF",
      marginBottom: 4,
      textAlign: "right",
    },
    valueContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    tokenValue: {
      fontSize: 14,
      color: "rgba(255, 255, 255, 0.8)",
      marginRight: 8,
    },
  });

  // Render the create variant differently
  if (variant === 'create') {
    return (
      <View style={styles.createContainer}>
        <LinearGradient
          colors={gradientColors as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.createGradientOverlay}
        />
        <View style={styles.createHeader}>
          <View style={styles.createIconContainer}>
            <TokenLogo 
              logo={token.logo} 
              symbol={token.symbol} 
              size={28} 
            />
          </View>
          <Text style={styles.createSymbol}>{token.symbol}</Text>
        </View>
        <View style={styles.createBalanceContainer}>
          <Text style={styles.createBalanceLabel}>Available Balance</Text>
          <Text style={styles.createBalanceValue}>{token.balance} {token.symbol}</Text>
        </View>
        {usdValue && (
          <View style={styles.createUsdContainer}>
            <Text style={styles.createUsdLabel}>USD Value</Text>
            <Text style={styles.createUsdValue}>${usdValue.replace('$', '')}</Text>
          </View>
        )}
      </View>
    );
  }

  // Default and compact variants use the gradient card design
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <LinearGradient
        colors={gradientColors as readonly [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.contentContainer}>
          <View style={styles.leftSection}>
            <View style={styles.logoContainer}>
              <TokenLogo 
                logo={token.logo} 
                symbol={token.symbol} 
                size={variant === 'compact' ? 30 : 40} 
              />
            </View>
            <View style={styles.nameContainer}>
              <Text style={styles.tokenSymbol}>{token.symbol}</Text>
              {token.name && <Text style={styles.tokenName}>{token.name}</Text>}
            </View>
          </View>

          <View style={styles.rightSection}>
            <Text style={styles.tokenBalance}>{token.balance}</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.tokenValue}>${usdValue ? usdValue.replace('$', '') : '0.00'}</Text>
              {token.change && (
                <View
                  style={[
                    styles.changeContainer,
                    {
                      backgroundColor: token.isPositive
                        ? "rgba(76, 217, 100, 0.2)"
                        : "rgba(255, 59, 48, 0.2)",
                    },
                  ]}
                >
                  <Ionicons
                    name={token.isPositive ? "arrow-up" : "arrow-down"}
                    size={10}
                    color={
                      token.isPositive
                        ? Colors[theme].success
                        : Colors[theme].error
                    }
                  />
                  <Text
                    style={[
                      styles.changeText,
                      {
                        color: token.isPositive
                          ? Colors[theme].success
                          : Colors[theme].error,
                      },
                    ]}
                  >
                    {token.change}%
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        {onRefresh && (
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="refresh" size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default TokenBalanceCard;
