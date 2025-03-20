import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Colors from '../../constants/Colors';

// Mock data for savings analytics
const savingsData = {
  currentMonth: '2,500.00',
  totalSaved: '17,298.92',
  savingsRate: 4.9,
  savingsHistory: [1200, 1350, 1500, 1750, 1975, 2500],
  months: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  breakdown: [
    { category: 'ETH Pool', amount: '450.00', color: Colors.light.primary },
    { category: 'USDC Pool', amount: '250.00', color: Colors.light.info },
    { category: 'DAI Pool', amount: '275.00', color: Colors.light.warning },
    { category: 'WBTC Pool', amount: '150.00', color: Colors.light.error },
  ]
};

const { width } = Dimensions.get('window');
const chartWidth = width - 64; // Accounting for padding

export default function AnalyticsScreen() {
  const [selectedMonth, setSelectedMonth] = useState('Jul 2024');
  
  // Find the max value for the chart scaling
  const maxValue = Math.max(...savingsData.savingsHistory);
  
  // Simple bar chart renderer
  const renderBarChart = () => {
    return (
      <View style={styles.chartContainer}>
        {/* Y-axis labels would go here */}
        <View style={styles.chart}>
          {savingsData.savingsHistory.map((value, index) => {
            const barHeight = (value / maxValue) * 150; // Max height of 150
            return (
              <View key={index} style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: barHeight,
                      backgroundColor: index === savingsData.savingsHistory.length - 1 
                        ? Colors.light.primary 
                        : Colors.light.secondaryLight
                    }
                  ]} 
                />
                <Text style={styles.barLabel}>{savingsData.months[index]}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };
  
  // Line chart for savings trend
  const renderLineChart = () => {
    // This would normally use a library like react-native-chart-kit
    // For simplicity, we're just showing a placeholder
    return (
      <View style={styles.lineChartContainer}>
        <View style={styles.lineChart}>
          {/* This is a simplified representation of a line chart */}
          <View style={styles.lineChartLine} />
          <View style={styles.lineChartDot} />
        </View>
        <View style={styles.xAxis}>
          {savingsData.months.map((month, index) => (
            <Text key={index} style={styles.xAxisLabel}>{month}</Text>
          ))}
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>
        
        {/* Savings Summary */}
        <Card variant="elevated" style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>My Savings</Text>
            <TouchableOpacity style={styles.monthSelector}>
              <Text style={styles.monthText}>{selectedMonth}</Text>
              <Ionicons name="chevron-down" size={16} color={Colors.light.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.amountContainer}>
            <Text style={styles.amountValue}>${savingsData.currentMonth}</Text>
            <View style={styles.rateContainer}>
              <Ionicons 
                name="arrow-up" 
                size={16} 
                color={Colors.light.success} 
              />
              <Text style={styles.rateText}>{savingsData.savingsRate}% from last month</Text>
            </View>
          </View>
          
          <View style={styles.weekDays}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <Text 
                key={index} 
                style={[
                  styles.weekDay,
                  index === 5 ? styles.activeWeekDay : null
                ]}
              >
                {day}
              </Text>
            ))}
          </View>
          
          {/* Bar chart */}
          {renderBarChart()}
        </Card>
        
        {/* Savings Breakdown */}
        <Card variant="elevated" style={styles.breakdownCard}>
          <View style={styles.breakdownHeader}>
            <Text style={styles.breakdownTitle}>Savings Breakdown</Text>
            <Text style={styles.breakdownSubtitle}>{selectedMonth}</Text>
          </View>
          
          {/* Savings by pool type */}
          {savingsData.breakdown.map((item, index) => (
            <View key={index} style={styles.breakdownItem}>
              <View style={styles.categoryContainer}>
                <View 
                  style={[
                    styles.categoryDot,
                    { backgroundColor: item.color }
                  ]} 
                />
                <Text style={styles.categoryName}>{item.category}</Text>
              </View>
              <Text style={styles.categoryAmount}>${item.amount}</Text>
            </View>
          ))}
        </Card>
        
        {/* Savings Trend */}
        <Card variant="elevated" style={styles.trendCard}>
          <Text style={styles.trendTitle}>Savings Trend</Text>
          {renderLineChart()}
        </Card>
        
        {/* Savings Goals */}
        <Card variant="elevated" style={styles.goalsCard}>
          <Text style={styles.goalsTitle}>Savings Goals</Text>
          
          <View style={styles.goalItem}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalName}>Emergency Fund</Text>
              <Text style={styles.goalProgress}>$3,000 / $5,000</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: '60%' }]} />
            </View>
          </View>
          
          <View style={styles.goalItem}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalName}>Vacation</Text>
              <Text style={styles.goalProgress}>$1,200 / $2,000</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: '60%' }]} />
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 14,
    marginRight: 4,
    color: Colors.light.text,
  },
  amountContainer: {
    marginBottom: 16,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  rateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateText: {
    fontSize: 12,
    color: Colors.light.success,
    marginLeft: 4,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDay: {
    fontSize: 12,
    color: Colors.light.text,
    opacity: 0.7,
  },
  activeWeekDay: {
    color: Colors.light.primary,
    fontWeight: 'bold',
    opacity: 1,
  },
  chartContainer: {
    height: 180,
    marginTop: 16,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 150,
  },
  barWrapper: {
    alignItems: 'center',
    width: (chartWidth - 40) / 6, // Divide available width by number of bars
  },
  bar: {
    width: 12,
    borderRadius: 6,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.light.text,
    opacity: 0.7,
  },
  breakdownCard: {
    marginBottom: 16,
  },
  breakdownHeader: {
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  breakdownSubtitle: {
    fontSize: 12,
    color: Colors.light.text,
    opacity: 0.7,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    color: Colors.light.text,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  trendCard: {
    marginBottom: 16,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  lineChartContainer: {
    height: 150,
  },
  lineChart: {
    height: 120,
    position: 'relative',
  },
  lineChartLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 60,
    height: 2,
    backgroundColor: Colors.light.primary,
    borderRadius: 1,
  },
  lineChartDot: {
    position: 'absolute',
    right: 0,
    top: 56,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.primary,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  xAxisLabel: {
    fontSize: 12,
    color: Colors.light.text,
    opacity: 0.7,
  },
  goalsCard: {
    marginBottom: 16,
  },
  goalsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  goalItem: {
    marginBottom: 16,
  },
  goalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalName: {
    fontSize: 14,
    color: Colors.light.text,
  },
  goalProgress: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
  },
});
