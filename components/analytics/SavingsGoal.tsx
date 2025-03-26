import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

interface SavingsGoalProps {
  name: string;
  current: number;
  target: number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  theme: 'light' | 'dark';
}

const SavingsGoal: React.FC<SavingsGoalProps> = ({
  name,
  current,
  target,
  icon,
  color,
  theme
}) => {
  // Calculate percentage
  const percentage = Math.min(Math.round((current / target) * 100), 100);
  const formattedCurrent = current.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  const formattedTarget = target.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return (
    <View style={styles.goalItem}>
      <View style={styles.goalTopRow}>
        <View style={[styles.goalIconContainer, { backgroundColor: color }]}>
          <MaterialCommunityIcons name={icon} size={20} color="#fff" />
        </View>
        <View style={styles.goalInfo}>
          <Text style={[styles.goalName, { color: Colors[theme].text }]}>{name}</Text>
          <Text style={[styles.goalProgress, { color: Colors[theme].textSecondary }]}>
            {formattedCurrent} / {formattedTarget}
          </Text>
        </View>
        <Text style={[styles.goalPercentage, { color: Colors[theme].text }]}>{percentage}%</Text>
      </View>
      <View style={[styles.progressBarContainer, { backgroundColor: Colors[theme].secondaryLight }]}>
        <View 
          style={[
            styles.progressBar, 
            { 
              width: `${percentage}%`, 
              backgroundColor: color 
            }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  goalItem: {
    marginBottom: 16,
  },
  goalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3F51B5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  goalProgress: {
    fontSize: 12,
  },
  goalPercentage: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
});

export default SavingsGoal;
