import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
  Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
    { category: 'USDC Pool', amount: '250.00', color: Colors.light.chart.blue },
    { category: 'DAI Pool', amount: '275.00', color: Colors.light.chart.yellow },
    { category: 'WBTC Pool', amount: '150.00', color: Colors.light.chart.orange },
  ]
};

const { width } = Dimensions.get('window');
const chartWidth = width - 64; // Accounting for padding

export default function AnalyticsScreen() {
  const [selectedMonth, setSelectedMonth] = useState('Jul 2024');
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  
  // Find the max value for the chart scaling
  const maxValue = Math.max(...savingsData.savingsHistory);
  
  // Simple bar chart renderer
  const renderBarChart = () => {
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartYAxis}>
          <Text style={styles.chartYLabel}>$2.5k</Text>
          <Text style={styles.chartYLabel}>$1.5k</Text>
          <Text style={styles.chartYLabel}>$0.5k</Text>
        </View>
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
                        : Colors.light.primaryLight
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
          {savingsData.savingsHistory.map((value, index) => {
            const dotPosition = (index / (savingsData.savingsHistory.length - 1)) * 100;
            const dotHeight = 120 - ((value / maxValue) * 100);
            return (
              <View 
                key={index} 
                style={[
                  styles.lineChartDot,
                  {
                    left: `${dotPosition}%`,
                    top: dotHeight,
                  }
                ]} 
              />
            );
          })}
        </View>
        <View style={styles.xAxis}>
          {savingsData.months.map((month, index) => (
            <Text key={index} style={styles.xAxisLabel}>{month}</Text>
          ))}
        </View>
      </View>
    );
  };
  
  const renderTimeframeSelector = () => {
    return (
      <View style={styles.timeframeSelector}>
        {['week', 'month', 'year', 'all'].map((timeframe) => (
          <TouchableOpacity
            key={timeframe}
            style={[
              styles.timeframeButton,
              selectedTimeframe === timeframe && styles.timeframeButtonActive
            ]}
            onPress={() => setSelectedTimeframe(timeframe)}
          >
            <Text 
              style={[
                styles.timeframeButtonText,
                selectedTimeframe === timeframe && styles.timeframeButtonTextActive
              ]}
            >
              {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="options-outline" size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
        
        {/* Savings Summary */}
        <Card variant="glass" style={styles.summaryCard}>
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
          
          {renderTimeframeSelector()}
          
          {/* Bar chart */}
          {renderBarChart()}
        </Card>
        
        {/* Savings Breakdown */}
        <Card variant="elevated" style={styles.breakdownCard}>
          <View style={styles.breakdownHeader}>
            <Text style={styles.breakdownTitle}>Savings Breakdown</Text>
            <Text style={styles.breakdownSubtitle}>{selectedMonth}</Text>
          </View>
          
          <View style={styles.pieChartContainer}>
            <View style={styles.pieChart}>
              {/* This is a placeholder for a pie chart */}
              <View style={styles.pieChartInner} />
            </View>
            <View style={styles.legendContainer}>
              {savingsData.breakdown.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View 
                    style={[
                      styles.legendDot,
                      { backgroundColor: item.color }
                    ]} 
                  />
                  <Text style={styles.legendText}>{item.category}</Text>
                </View>
              ))}
            </View>
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
          <View style={styles.trendHeader}>
            <Text style={styles.trendTitle}>Savings Trend</Text>
            <TouchableOpacity style={styles.trendButton}>
              <Text style={styles.trendButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
          {renderLineChart()}
        </Card>
        
        {/* Savings Goals */}
        <Card variant="elevated" style={styles.goalsCard}>
          <View style={styles.goalsHeader}>
            <Text style={styles.goalsTitle}>Savings Goals</Text>
            <TouchableOpacity style={styles.addGoalButton}>
              <Ionicons name="add-circle-outline" size={20} color={Colors.light.primary} />
              <Text style={styles.addGoalText}>Add Goal</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.goalItem}>
            <View style={styles.goalTopRow}>
              <View style={styles.goalIconContainer}>
                <MaterialCommunityIcons name="shield-home" size={20} color="#fff" />
              </View>
              <View style={styles.goalInfo}>
                <Text style={styles.goalName}>Emergency Fund</Text>
                <Text style={styles.goalProgress}>$3,000 / $5,000</Text>
              </View>
              <Text style={styles.goalPercentage}>60%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: '60%', backgroundColor: Colors.light.chart.blue }]} />
            </View>
          </View>
          
          <View style={styles.goalItem}>
            <View style={styles.goalTopRow}>
              <View style={[styles.goalIconContainer, { backgroundColor: Colors.light.chart.orange }]}>
                <MaterialCommunityIcons name="airplane" size={20} color="#fff" />
              </View>
              <View style={styles.goalInfo}>
                <Text style={styles.goalName}>Vacation</Text>
                <Text style={styles.goalProgress}>$1,200 / $2,000</Text>
              </View>
              <Text style={styles.goalPercentage}>60%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: '60%', backgroundColor: Colors.light.chart.orange }]} />
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
    backgroundColor: Colors.light.secondaryLight,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
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
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  rateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateText: {
    fontSize: 14,
    color: Colors.light.success,
    marginLeft: 4,
  },
  timeframeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: Colors.light.secondary,
    borderRadius: 25,
    padding: 4,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  timeframeButtonActive: {
    backgroundColor: Colors.light.card,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  timeframeButtonText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  timeframeButtonTextActive: {
    color: Colors.light.text,
    fontWeight: '600',
  },
  chartContainer: {
    height: 180,
    marginTop: 16,
    flexDirection: 'row',
  },
  chartYAxis: {
    width: 40,
    height: 150,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  chartYLabel: {
    fontSize: 10,
    color: Colors.light.textSecondary,
  },
  chart: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 150,
  },
  barWrapper: {
    alignItems: 'center',
    width: (chartWidth - 80) / 6, // Divide available width by number of bars
  },
  bar: {
    width: 16,
    borderRadius: 8,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  breakdownCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  breakdownHeader: {
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  breakdownSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  pieChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pieChart: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieChartInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.card,
  },
  legendContainer: {
    flex: 1,
    marginLeft: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.secondaryLight,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    color: Colors.light.text,
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  trendCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trendTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  trendButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Colors.light.secondary,
  },
  trendButtonText: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '500',
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
    marginLeft: -4,
    marginTop: -4,
    borderWidth: 2,
    borderColor: Colors.light.card,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  xAxisLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  goalsCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addGoalText: {
    fontSize: 14,
    color: Colors.light.primary,
    marginLeft: 4,
  },
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
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
  },
  goalProgress: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  goalPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.light.secondaryLight,
    borderRadius: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
  },
});
