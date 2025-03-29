import React from 'react';
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

  const getIconName = () => {
    return type === 'success' ? 'checkmark-circle' : 'alert-circle';
  };

  const getGradientColors = (): [string, string] => {
    return type === 'success'
      ? isDarkMode
        ? ['#2E7D32', '#1A237E']
        : ['#4CAF50', '#1E88E5']
      : isDarkMode
      ? ['#D32F2F', '#1A237E']
      : ['#F44336', '#1E88E5'];
  };

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
          <LinearGradient
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={getIconName()}
                size={40}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.title}>{title}</Text>
          </LinearGradient>

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
  headerGradient: {
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