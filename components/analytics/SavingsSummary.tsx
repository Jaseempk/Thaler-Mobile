import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/Colors';

interface SavingsSummaryProps {
  currentAmount: string;
  changeRate: number;
  isPositive: boolean;
  selectedMonth: string;
  onMonthSelect: () => void;
  theme: 'light' | 'dark';
}

const SavingsSummary: React.FC<SavingsSummaryProps> = ({
  currentAmount,
  changeRate,
  isPositive,
  selectedMonth,
  onMonthSelect,
  theme
}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme === 'dark' ? ['#1A1A1A', '#2D2D2D'] : ['#FFFFFF', '#F5F5F5']}
        style={styles.cardGradient}
      >
        <View style={styles.summaryHeader}>
          <Text style={[styles.summaryTitle, { color: Colors[theme].text }]}>My Savings</Text>
          <TouchableOpacity 
            style={[styles.monthSelector, { backgroundColor: Colors[theme].secondaryLight }]}
            onPress={onMonthSelect}
          >
            <Text style={[styles.monthText, { color: Colors[theme].text }]}>{selectedMonth}</Text>
            <Ionicons name="chevron-down" size={16} color={Colors[theme].text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.amountContainer}>
          <Text style={[styles.amountValue, { color: Colors[theme].text }]}>${currentAmount}</Text>
          <View style={styles.rateContainer}>
            <Ionicons 
              name={isPositive ? "arrow-up" : "arrow-down"} 
              size={16} 
              color={isPositive ? Colors[theme].success : Colors[theme].error} 
            />
            <Text 
              style={[
                styles.rateText, 
                { color: isPositive ? Colors[theme].success : Colors[theme].error }
              ]}
            >
              {changeRate}% from last month
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  monthText: {
    fontSize: 14,
    marginRight: 4,
  },
  amountContainer: {
    marginTop: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateText: {
    fontSize: 14,
    marginLeft: 4,
  },
});

export default SavingsSummary;
