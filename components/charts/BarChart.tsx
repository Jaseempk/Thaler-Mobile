import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Colors from '../../constants/Colors';

interface BarChartProps {
  data: number[];
  labels: string[];
  maxValue?: number;
  height?: number;
  barColor?: string;
  highlightLastBar?: boolean;
  highlightColor?: string;
  theme: 'light' | 'dark';
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  labels,
  maxValue: propMaxValue,
  height = 150,
  barColor,
  highlightLastBar = true,
  highlightColor,
  theme
}) => {
  // Calculate max value if not provided
  const maxValue = propMaxValue || Math.max(...data);
  
  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartYAxis}>
        <Text style={[styles.chartYLabel, { color: Colors[theme].textSecondary }]}>
          ${(maxValue).toFixed(1)}k
        </Text>
        <Text style={[styles.chartYLabel, { color: Colors[theme].textSecondary }]}>
          ${(maxValue / 2).toFixed(1)}k
        </Text>
        <Text style={[styles.chartYLabel, { color: Colors[theme].textSecondary }]}>
          ${(maxValue / 4).toFixed(1)}k
        </Text>
      </View>
      <View style={styles.chart}>
        {data.map((value, index) => {
          const barHeight = (value / maxValue) * height;
          const isLastBar = index === data.length - 1;
          const barBackgroundColor = isLastBar && highlightLastBar
            ? (highlightColor || Colors[theme].primary)
            : (barColor || Colors[theme].primaryLight);
            
          return (
            <View key={index} style={styles.barWrapper}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: barHeight,
                    backgroundColor: barBackgroundColor
                  }
                ]} 
              />
              <Text style={[styles.barLabel, { color: Colors[theme].textSecondary }]}>
                {labels[index]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    flexDirection: 'row',
    height: 180,
    marginTop: 16,
    marginBottom: 8,
  },
  chartYAxis: {
    width: 40,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
    paddingVertical: 10,
  },
  chartYLabel: {
    fontSize: 10,
    color: '#888',
  },
  chart: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 24,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  bar: {
    width: 8,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  barLabel: {
    fontSize: 10,
    marginTop: 6,
    color: '#888',
  },
});

export default BarChart;
