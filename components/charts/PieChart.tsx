import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Colors from '../../constants/Colors';

interface PieChartItem {
  value: number;
  color: string;
  label: string;
}

interface PieChartProps {
  data: PieChartItem[];
  size?: number;
  centerLabel?: string;
  centerValue?: string;
  theme: 'light' | 'dark';
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 120,
  centerLabel,
  centerValue,
  theme
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // We're creating a simple pie chart visualization
  // In a real app, you'd use a proper charting library
  return (
    <View style={[styles.pieChartContainer, { width: size, height: size }]}>
      <View style={[styles.pieChart, { width: size, height: size }]}>
        {/* Colored segments would be drawn here with a proper chart library */}
        {data.map((item, index) => {
          // This is a simplified representation - in a real app, you'd calculate
          // actual segment angles and positions
          const segmentSize = (item.value / total) * 100;
          return (
            <View 
              key={index}
              style={[
                styles.pieSegmentIndicator,
                {
                  backgroundColor: item.color,
                  width: 8,
                  height: 8,
                  transform: [{ rotate: `${index * (360 / data.length)}deg` }],
                  top: size / 2 - 4,
                  left: size - 20,
                }
              ]}
            />
          );
        })}
        <View style={[styles.pieChartInner, { width: size * 0.7, height: size * 0.7 }]} />
        <View style={styles.pieChartCenter}>
          {centerValue && (
            <Text style={[styles.pieChartTotal, { color: Colors[theme].text }]}>
              {centerValue}
            </Text>
          )}
          {centerLabel && (
            <Text style={[styles.pieChartLabel, { color: Colors[theme].textSecondary }]}>
              {centerLabel}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  pieChart: {
    position: 'relative',
    borderRadius: 100,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pieChartInner: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'white',
  },
  pieSegmentIndicator: {
    position: 'absolute',
    borderRadius: 4,
  },
  pieChartCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieChartTotal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pieChartLabel: {
    fontSize: 12,
  },
});

export default PieChart;
