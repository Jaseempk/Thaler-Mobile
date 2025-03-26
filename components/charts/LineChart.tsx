import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Colors from '../../constants/Colors';

interface LineChartProps {
  data: number[];
  labels: string[];
  maxValue?: number;
  height?: number;
  lineColor?: string;
  dotColor?: string;
  theme: 'light' | 'dark';
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  labels,
  maxValue: propMaxValue,
  height = 120,
  lineColor,
  dotColor,
  theme
}) => {
  // Calculate max value if not provided
  const maxValue = propMaxValue || Math.max(...data);
  
  return (
    <View style={styles.container}>
      <View style={styles.lineChartContainer}>
        <View style={[styles.lineChart, { height }]}>
          <View 
            style={[
              styles.lineChartLine, 
              { 
                backgroundColor: lineColor || Colors[theme].primary,
                height: 2
              }
            ]} 
          />
          {data.map((value, index) => {
            const dotPosition = (index / (data.length - 1)) * 100;
            const dotTop = height - ((value / maxValue) * height);
            return (
              <View 
                key={index} 
                style={[
                  styles.lineChartDot,
                  {
                    left: `${dotPosition}%`,
                    top: dotTop,
                    backgroundColor: dotColor || Colors[theme].primary,
                  }
                ]} 
              />
            );
          })}
        </View>
        <View style={styles.xAxis}>
          {labels.map((label, index) => (
            <Text 
              key={index} 
              style={[styles.xAxisLabel, { color: Colors[theme].textSecondary }]}
            >
              {label}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  lineChartContainer: {
    marginTop: 8,
  },
  lineChart: {
    position: 'relative',
    width: '100%',
    height: 120,
  },
  lineChartLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  lineChartDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3F51B5',
    marginLeft: -4,
    marginTop: -4,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  xAxisLabel: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
  },
});

export default LineChart;
