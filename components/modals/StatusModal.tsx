import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Clipboard,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { router } from 'expo-router';
import { Easing } from 'react-native';

const { width } = Dimensions.get('window');

// Define the types of status modals
export type StatusType = 'success' | 'error' | 'info' | 'warning';

// Define the action button type
interface ActionButton {
  label: string;
  onPress: () => void;
  primary?: boolean;
}

interface StatusModalProps {
  visible: boolean;
  onClose: () => void;
  type: StatusType;
  title: string;
  message?: string;
  amount?: string;
  amountLabel?: string;
  transactionHash?: string;
  timestamp?: Date;
  actionButtons?: ActionButton[];
  theme?: 'light' | 'dark';
}

export default function StatusModal({
  visible,
  onClose,
  type,
  title,
  message,
  amount,
  amountLabel,
  transactionHash,
  timestamp = new Date(),
  actionButtons,
  theme: themeProp,
}: StatusModalProps) {
  const systemTheme = useColorScheme();
  const theme = themeProp || systemTheme || 'dark';
  const isDarkMode = theme === 'dark';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const particleAnim1 = useRef(new Animated.Value(0)).current;
  const particleAnim2 = useRef(new Animated.Value(0)).current;
  const particleAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animations = [];
    
    if (visible) {
      // Fade and scale in animation
      const fadeInAnimation = Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]);
      
      fadeInAnimation.start();
      
      // Simplified particle animations - only use one particle animation to reduce load
      const particleAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(particleAnim1, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: true,
          }),
          Animated.timing(particleAnim1, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      
      particleAnimation.start();
      animations.push(particleAnimation);
      
      // Add a subtle pulse animation to the icon - simplified
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      );
      
      // Start the pulse animation after a short delay to prevent conflicts
      setTimeout(() => {
        pulseAnimation.start();
        animations.push(pulseAnimation);
      }, 500);
    } else {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);
      particleAnim1.setValue(0);
      particleAnim2.setValue(0);
      particleAnim3.setValue(0);
    }
    
    // Cleanup function to stop all animations when component unmounts or visibility changes
    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [visible]);

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark';
      case 'error':
        return 'close';
      case 'warning':
        return 'warning';
      case 'info':
        return 'information';
      default:
        return 'checkmark';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return 'rgba(74, 222, 128, 0.8)';
      case 'error':
        return 'rgba(248, 113, 113, 0.8)';
      case 'warning':
        return 'rgba(251, 191, 36, 0.8)';
      case 'info':
        return 'rgba(96, 165, 250, 0.8)';
      default:
        return 'rgba(74, 222, 128, 0.8)';
    }
  };

  const getIconGlowColor = () => {
    switch (type) {
      case 'success':
        return 'rgba(74, 222, 128, 0.4)';
      case 'error':
        return 'rgba(248, 113, 113, 0.4)';
      case 'warning':
        return 'rgba(251, 191, 36, 0.4)';
      case 'info':
        return 'rgba(96, 165, 250, 0.4)';
      default:
        return 'rgba(74, 222, 128, 0.4)';
    }
  };

  const getBackgroundColor = () => {
    return isDarkMode ? '#121826' : '#FFFFFF';
  };

  const getTextColor = () => {
    return isDarkMode ? '#FFFFFF' : '#1F2937';
  };

  const getSecondaryTextColor = () => {
    return isDarkMode ? '#9CA3AF' : '#6B7280';
  };

  const formatTimestamp = () => {
    if (!timestamp) return '';

    // If today, show time
    const today = new Date();
    if (
      timestamp.getDate() === today.getDate() &&
      timestamp.getMonth() === today.getMonth() &&
      timestamp.getFullYear() === today.getFullYear()
    ) {
      return `Today, ${timestamp.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }

    // Otherwise show relative time
    return formatDistanceToNow(timestamp, { addSuffix: true });
  };

  // Format transaction hash for display
  const formatHash = (hash: string) => {
    if (!hash) return '';
    if (hash.length <= 12) return hash;
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Background particles - add more for a richer effect */}
        <Animated.View
          style={[
            styles.particle,
            {
              top: '10%',
              left: '20%',
              backgroundColor: '#3B82F6',
              transform: [
                {
                  translateX: particleAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, width * 0.7],
                  }),
                },
                {
                  translateY: particleAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, width * 0.5],
                  }),
                },
                {
                  rotate: particleAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            {
              top: '30%',
              right: '15%',
              backgroundColor: '#F59E0B',
              transform: [
                {
                  translateX: particleAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -width * 0.5],
                  }),
                },
                {
                  translateY: particleAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, width * 0.6],
                  }),
                },
                {
                  rotate: particleAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '-360deg'],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            {
              top: '20%',
              right: '25%',
              backgroundColor: '#10B981',
              transform: [
                {
                  translateX: particleAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, width * 0.4],
                  }),
                },
                {
                  translateY: particleAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -width * 0.6],
                  }),
                },
                {
                  rotate: particleAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            {
              bottom: '45%',
              left: '25%',
              backgroundColor: '#8B5CF6',
              transform: [
                {
                  translateX: particleAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, width * 0.3],
                  }),
                },
                {
                  translateY: particleAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -width * 0.4],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.smallParticle,
            {
              bottom: '35%',
              right: '20%',
              backgroundColor: '#EC4899',
              transform: [
                {
                  translateX: particleAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -width * 0.2],
                  }),
                },
                {
                  translateY: particleAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, width * 0.3],
                  }),
                },
              ],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.modalContent,
            {
              backgroundColor: getBackgroundColor(),
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Status Icon with enhanced glow effect */}
          <View style={styles.iconWrapper}>
            <Animated.View
              style={[
                styles.iconGlow,
                {
                  backgroundColor: getIconGlowColor(),
                  transform: [
                    {
                      scale: scaleAnim.interpolate({
                        inputRange: [0.95, 1, 1.05],
                        outputRange: [0.9, 1.1, 1.2],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: getIconColor(),
                  transform: [
                    {
                      scale: scaleAnim.interpolate({
                        inputRange: [0.95, 1, 1.05],
                        outputRange: [0.95, 1, 1.05],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Ionicons
                name={getIconName()}
                size={32}
                color="#FFFFFF"
              />
            </Animated.View>
          </View>

          {/* Title with subtle animation */}
          <Animated.Text
            style={[
              styles.title,
              {
                color: getTextColor(),
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {title}
          </Animated.Text>

          {/* Amount (if provided) with emphasis animation */}
          {amount && (
            <Animated.Text
              style={[
                styles.amount,
                {
                  color: getTextColor(),
                  transform: [
                    {
                      scale: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              {amount} {amountLabel}
            </Animated.Text>
          )}

          {/* Transaction Hash (if provided) with subtle highlight effect */}
          {transactionHash && (
            <TouchableOpacity
              style={styles.hashContainer}
              onPress={() => {
                Clipboard.setString(transactionHash);
                // Add a visual feedback when copied
                Alert.alert("Copied", "Transaction hash copied to clipboard");
              }}
            >
              <Text
                style={[
                  styles.hashText,
                  { color: getSecondaryTextColor() },
                ]}
              >
                {formatHash(transactionHash)}
              </Text>
              <Ionicons
                name="copy-outline"
                size={16}
                color={getSecondaryTextColor()}
                style={styles.copyIcon}
              />
            </TouchableOpacity>
          )}

          {/* Timestamp with subtle fade-in */}
          <Animated.Text
            style={[
              styles.timestamp,
              {
                color: getSecondaryTextColor(),
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.8],
                }),
              },
            ]}
          >
            {formatTimestamp()}
          </Animated.Text>

          {/* Message (if provided) with staggered fade-in */}
          {message && (
            <Animated.Text
              style={[
                styles.message,
                {
                  color: getTextColor(),
                  opacity: fadeAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0.5, 1],
                  }),
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [10, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {message}
            </Animated.Text>
          )}

          {/* Action Buttons with improved visual feedback */}
          <View style={styles.buttonsContainer}>
            {actionButtons ? (
              <>
                {/* If custom action buttons are provided */}
                {actionButtons.length === 1 ? (
                  <TouchableOpacity
                    style={[
                      styles.fullWidthButton,
                      {
                        backgroundColor:
                          actionButtons[0].primary ? '#4F46E5' : 'transparent',
                      },
                      !actionButtons[0].primary && {
                        borderWidth: 1,
                        borderColor: isDarkMode ? '#374151' : '#E5E7EB',
                      },
                    ]}
                    onPress={actionButtons[0].onPress}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        {
                          color: actionButtons[0].primary
                            ? '#FFFFFF'
                            : getTextColor(),
                        },
                      ]}
                    >
                      {actionButtons[0].label}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <View style={styles.buttonRow}>
                      {actionButtons.slice(0, 2).map((button, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.button,
                            {
                              backgroundColor:
                                button.primary ? '#4F46E5' : 'transparent',
                            },
                            !button.primary && {
                              borderWidth: 1,
                              borderColor: isDarkMode ? '#374151' : '#E5E7EB',
                            },
                            index === 0 && { marginRight: 8 },
                          ]}
                          onPress={button.onPress}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.buttonText,
                              {
                                color: button.primary
                                  ? '#FFFFFF'
                                  : getTextColor(),
                              },
                            ]}
                          >
                            {button.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {actionButtons.length > 2 && (
                      <TouchableOpacity
                        style={[
                          styles.fullWidthButton,
                          {
                            backgroundColor:
                              actionButtons[2].primary ? '#4F46E5' : 'transparent',
                            marginTop: 12,
                          },
                          !actionButtons[2].primary && {
                            borderWidth: 1,
                            borderColor: isDarkMode ? '#374151' : '#E5E7EB',
                          },
                        ]}
                        onPress={actionButtons[2].onPress}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.buttonText,
                            {
                              color: actionButtons[2].primary
                                ? '#FFFFFF'
                                : getTextColor(),
                            },
                          ]}
                        >
                          {actionButtons[2].label}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </>
            ) : (
              // Default close button if no custom buttons provided
              <TouchableOpacity
                style={[styles.fullWidthButton, { backgroundColor: '#4F46E5' }]}
                onPress={() => {
                  onClose();
                  router.replace('/tabs');
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                  Close
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width - 48,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  particle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.6,
  },
  smallParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.4,
  },
  iconWrapper: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 72,
    height: 72,
  },
  iconGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    opacity: 0.6,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: 'rgba(74, 222, 128, 0.8)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  amount: {
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  hashContainer: {
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  hashText: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  copyIcon: {
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 16,
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  buttonsContainer: {
    width: '100%',
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidthButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});