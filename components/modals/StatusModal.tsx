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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface StatusModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  title: string;
  message: string;
  transactionHash?: string;
  theme: 'light' | 'dark';
}

export default function StatusModal({
  visible,
  onClose,
  type,
  title,
  message,
  transactionHash,
  theme,
}: StatusModalProps) {
  const isDarkMode = theme === 'dark';
  const animatedValue1 = useRef(new Animated.Value(0)).current;
  const animatedValue2 = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // First animation: flowing gradient
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue1, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
            easing: (t) => t,
          }),
        ])
      ).start();

      // Second animation: pulsing effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue2, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
            easing: (t) => Math.sin(t * Math.PI),
          }),
        ])
      ).start();

      // Scale animation for the icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
            easing: (t) => Math.sin(t * Math.PI),
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
            easing: (t) => Math.sin(t * Math.PI),
          }),
        ])
      ).start();
    } else {
      animatedValue1.setValue(0);
      animatedValue2.setValue(0);
      scaleValue.setValue(1);
    }
  }, [visible]);

  const getIconName = () => {
    return type === 'success' ? 'checkmark-circle' : 'alert-circle';
  };

  const getGradientColors = (): [string, string, string] => {
    return type === 'success'
      ? isDarkMode
        ? ['#00C853', '#1B5E20', '#00C853']
        : ['#69F0AE', '#00C853', '#69F0AE']
      : isDarkMode
      ? ['#D32F2F', '#1A237E', '#D32F2F']
      : ['#F44336', '#1E88E5', '#F44336'];
  };

  const translateX1 = animatedValue1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width],
  });

  const translateX2 = animatedValue2.interpolate({
    inputRange: [0, 1],
    outputRange: [width, 0],
  });

  const opacity = animatedValue2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              backgroundColor: Colors[theme].card,
              transform: [
                {
                  scale: new Animated.Value(1),
                },
              ],
            },
          ]}
        >
          <View style={styles.headerContainer}>
            <LinearGradient
              colors={getGradientColors()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.headerGradient, { position: 'absolute' }]}
            />
            <Animated.View
              style={[
                styles.animatedGradient,
                {
                  transform: [{ translateX: translateX1 }],
                },
              ]}
            >
              <LinearGradient
                colors={['transparent', 'rgba(255, 255, 255, 0.15)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shineGradient}
              />
            </Animated.View>
            <Animated.View
              style={[
                styles.animatedGradient,
                {
                  transform: [{ translateX: translateX2 }],
                  opacity,
                },
              ]}
            >
              <LinearGradient
                colors={['transparent', 'rgba(255, 255, 255, 0.1)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shineGradient}
              />
            </Animated.View>
            <View style={styles.headerContent}>
              <Animated.View
                style={[
                  styles.iconContainer,
                  {
                    transform: [{ scale: scaleValue }],
                  },
                ]}
              >
                <Ionicons
                  name={getIconName()}
                  size={40}
                  color="#FFFFFF"
                />
              </Animated.View>
              <Text style={styles.title}>{title}</Text>
            </View>
          </View>

          <View style={styles.content}>
            <Text
              style={[
                styles.message,
                { color: Colors[theme].text },
              ]}
            >
              {message}
            </Text>

            {transactionHash && (
              <View style={styles.hashContainer}>
                <Text
                  style={[
                    styles.hashLabel,
                    { color: Colors[theme].textSecondary },
                  ]}
                >
                  Transaction Hash
                </Text>
                <TouchableOpacity
                  style={styles.hashRow}
                  onPress={() => {
                    Clipboard.setString(transactionHash);
                  }}
                >
                  <Text
                    style={[
                      styles.hashText,
                      { color: Colors[theme].primary },
                    ]}
                    numberOfLines={1}
                  >
                    {transactionHash}
                  </Text>
                  <Ionicons
                    name="copy-outline"
                    size={16}
                    color={Colors[theme].primary}
                  />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: Colors[theme].primary },
              ]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width - 32,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  headerContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  animatedGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shineGradient: {
    width: width,
    height: '100%',
  },
  headerContent: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    padding: 24,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  hashContainer: {
    marginBottom: 24,
  },
  hashLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  hashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 12,
    borderRadius: 8,
  },
  hashText: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
  closeButton: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 