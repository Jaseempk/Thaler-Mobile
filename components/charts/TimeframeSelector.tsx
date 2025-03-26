import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../../constants/Colors';

type Timeframe = 'day' | 'week' | 'month' | 'year' | 'all';

interface TimeframeSelectorProps {
  selectedTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
  timeframes?: Timeframe[];
  theme: 'light' | 'dark';
}

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  selectedTimeframe,
  onTimeframeChange,
  timeframes = ['week', 'month', 'year', 'all'],
  theme
}) => {
  return (
    <View style={styles.timeframeSelector}>
      {timeframes.map((timeframe) => (
        <TouchableOpacity
          key={timeframe}
          style={[
            styles.timeframeButton,
            selectedTimeframe === timeframe && [
              styles.timeframeButtonActive,
              { backgroundColor: Colors[theme].primary }
            ]
          ]}
          onPress={() => onTimeframeChange(timeframe)}
        >
          <Text 
            style={[
              styles.timeframeButtonText,
              selectedTimeframe === timeframe && [
                styles.timeframeButtonTextActive,
                { color: '#FFFFFF' }
              ],
              { color: selectedTimeframe === timeframe ? '#FFFFFF' : Colors[theme].text }
            ]}
          >
            {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  timeframeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 20,
    padding: 4,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeframeButtonActive: {
    backgroundColor: '#3F51B5',
  },
  timeframeButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timeframeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default TimeframeSelector;
