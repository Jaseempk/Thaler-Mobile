import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import Card from "../../components/common/Card";
import Colors from "../../constants/Colors";
import { useTheme } from "../../contexts/ThemeContext";
import ThemedStatusBar from "../../components/ui/ThemedStatusBar";
import { LinearGradient } from "expo-linear-gradient";
import BarChart from "../../components/charts/BarChart";
import LineChart from "../../components/charts/LineChart";
import PieChart from "../../components/charts/PieChart";
import TimeframeSelector from "../../components/charts/TimeframeSelector";
import SavingsGoal from "../../components/analytics/SavingsGoal";
import SavingsBreakdown from "../../components/analytics/SavingsBreakdown";
import SavingsSummary from "../../components/analytics/SavingsSummary";

// Mock data for savings analytics
const savingsData = {
  currentMonth: "2,500.00",
  totalSaved: "17,298.92",
  savingsRate: 4.9,
  savingsHistory: [1200, 1350, 1500, 1750, 1975, 2500],
  months: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  breakdown: [
    { category: "ETH Pool", amount: "450.00", color: Colors.light.primary },
    { category: "USDC Pool", amount: "250.00", color: Colors.light.chart.blue },
    {
      category: "DAI Pool",
      amount: "275.00",
      color: Colors.light.chart.yellow,
    },
    {
      category: "WBTC Pool",
      amount: "150.00",
      color: Colors.light.chart.orange,
    },
  ],
  goals: [
    {
      name: "Emergency Fund",
      current: 3000,
      target: 5000,
      icon: "shield-home",
      color: Colors.light.chart.blue,
    },
    {
      name: "Vacation",
      current: 1200,
      target: 2000,
      icon: "airplane",
      color: Colors.light.chart.orange,
    },
  ],
};

// Get screen dimensions for responsive layouts
const { width } = Dimensions.get("window");
const chartWidth = width - 64; // Accounting for padding

export default function AnalyticsScreen() {
  // Debug log to check for duplicate style properties
  console.log("Style keys:", Object.keys(styles));
  console.log("Duplicate style keys:", findDuplicates(Object.keys(styles)));

  const { activeTheme, theme: isDarkMode } = useTheme();
  const [selectedMonth, setSelectedMonth] = useState("Jul 2024");
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<Timeframe>("month");
  const [isLoading, setIsLoading] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Helper function to find duplicates in an array
  function findDuplicates(arr: string[]) {
    return arr.filter((item, index) => arr.indexOf(item) !== index);
  }

  // Simulate data loading when timeframe changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsLoading(false);
    };

    loadData();
  }, [selectedTimeframe]);

  // Handle month selection
  const handleMonthSelect = () => {
    setShowMonthPicker(true);
  };

  // Define Timeframe type to match the component
  type Timeframe = "day" | "week" | "month" | "year" | "all";

  // Handle timeframe change
  const handleTimeframeChange = (timeframe: Timeframe) => {
    console.log("Timeframe selected:", timeframe, typeof timeframe);
    setSelectedTimeframe(timeframe as Timeframe);
  };

  // Find the max value for the chart scaling
  const maxValue = Math.max(...savingsData.savingsHistory);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[activeTheme].background },
      ]}
    >
      <ThemedStatusBar />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text
            style={[styles.headerTitle, { color: Colors[activeTheme].text }]}
          >
            Analytics
          </Text>
          <TouchableOpacity
            style={[
              styles.headerIconButton,
              { backgroundColor: Colors[activeTheme].secondaryLight },
            ]}
          >
            <Ionicons
              name="options-outline"
              size={24}
              color={Colors[activeTheme].text}
            />
          </TouchableOpacity>
        </View>

        {/* Savings Summary */}
        <Card
          variant="glass"
          style={{
            ...styles.summaryCard,
            backgroundColor: Colors[activeTheme].card,
          }}
        >
          <SavingsSummary
            currentAmount={savingsData.currentMonth}
            changeRate={savingsData.savingsRate}
            isPositive={true}
            selectedMonth={selectedMonth}
            onMonthSelect={handleMonthSelect}
            theme={activeTheme}
          />

          <TimeframeSelector
            selectedTimeframe={selectedTimeframe}
            onTimeframeChange={handleTimeframeChange}
            timeframes={["week", "month", "year", "all"]}
            theme={activeTheme}
          />

          {/* Bar chart */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={Colors[activeTheme].primary}
              />
            </View>
          ) : (
            <BarChart
              data={savingsData.savingsHistory}
              labels={savingsData.months}
              maxValue={maxValue}
              highlightLastBar={true}
              highlightColor={Colors[activeTheme].primary}
              barColor={Colors[activeTheme].primaryLight}
              theme={activeTheme}
            />
          )}

          <View style={styles.totalSavingsContainer}>
            <View style={styles.totalSavingsItem}>
              <Text
                style={[
                  styles.totalSavingsLabel,
                  { color: Colors[activeTheme].textSecondary },
                ]}
              >
                Total Saved
              </Text>
              <Text
                style={[
                  styles.totalSavingsValue,
                  { color: Colors[activeTheme].text },
                ]}
              >
                ${savingsData.totalSaved}
              </Text>
            </View>
            <View style={styles.totalSavingsItem}>
              <Text
                style={[
                  styles.totalSavingsLabel,
                  { color: Colors[activeTheme].textSecondary },
                ]}
              >
                Average Monthly
              </Text>
              <Text
                style={[
                  styles.totalSavingsValue,
                  { color: Colors[activeTheme].text },
                ]}
              >
                $1,625.00
              </Text>
            </View>
          </View>
        </Card>

        {/* Savings Breakdown */}
        <Card
          variant="elevated"
          style={{
            ...styles.breakdownCard,
            backgroundColor: Colors[activeTheme].card,
          }}
        >
          <SavingsBreakdown
            data={savingsData.breakdown}
            title="Savings Breakdown"
            subtitle={selectedMonth}
            theme={activeTheme}
          />
        </Card>

        {/* Savings Trend */}
        <Card
          variant="elevated"
          style={{
            ...styles.trendCard,
            backgroundColor: Colors[activeTheme].card,
          }}
        >
          <View style={styles.trendHeader}>
            <Text
              style={[styles.trendTitle, { color: Colors[activeTheme].text }]}
            >
              Savings Trend
            </Text>
            <TouchableOpacity
              style={[
                styles.trendButton,
                { backgroundColor: Colors[activeTheme].secondaryLight },
              ]}
            >
              <Text
                style={[
                  styles.trendButtonText,
                  { color: Colors[activeTheme].primary },
                ]}
              >
                View Details
              </Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={Colors[activeTheme].primary}
              />
            </View>
          ) : (
            <LineChart
              data={savingsData.savingsHistory}
              labels={savingsData.months}
              lineColor={Colors[activeTheme].primary}
              dotColor={Colors[activeTheme].primary}
              theme={activeTheme}
            />
          )}
        </Card>

        {/* Savings Goals */}
        <Card
          variant="elevated"
          style={{
            ...styles.goalsCard,
            backgroundColor: Colors[activeTheme].card,
          }}
        >
          <View style={styles.goalsHeader}>
            <Text
              style={[styles.goalsTitle, { color: Colors[activeTheme].text }]}
            >
              Savings Goals
            </Text>
            <TouchableOpacity style={styles.addGoalButton}>
              <Ionicons
                name="add-circle-outline"
                size={20}
                color={Colors[activeTheme].primary}
              />
              <Text
                style={[
                  styles.addGoalText,
                  { color: Colors[activeTheme].primary },
                ]}
              >
                Add Goal
              </Text>
            </TouchableOpacity>
          </View>

          {savingsData.goals.map((goal, index) => (
            <SavingsGoal
              key={index}
              name={goal.name}
              current={goal.current}
              target={goal.target}
              icon={goal.icon as keyof typeof MaterialCommunityIcons.glyphMap}
              color={goal.color}
              theme={activeTheme}
            />
          ))}
        </Card>
      </ScrollView>

      {/* Month Picker Modal */}
      <Modal
        visible={showMonthPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMonthPicker(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: Colors[activeTheme].card },
            ]}
          >
            <Text
              style={[styles.modalTitle, { color: Colors[activeTheme].text }]}
            >
              Select Month
            </Text>

            <TouchableOpacity
              style={styles.monthOption}
              onPress={() => {
                setSelectedMonth("Jul 2024");
                setShowMonthPicker(false);
              }}
            >
              <Text
                style={[
                  styles.monthOptionText,
                  { color: Colors[activeTheme].text },
                ]}
              >
                July 2024
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.monthOption}
              onPress={() => {
                setSelectedMonth("Jun 2024");
                setShowMonthPicker(false);
              }}
            >
              <Text
                style={[
                  styles.monthOptionText,
                  { color: Colors[activeTheme].text },
                ]}
              >
                June 2024
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.monthOption}
              onPress={() => {
                setSelectedMonth("May 2024");
                setShowMonthPicker(false);
              }}
            >
              <Text
                style={[
                  styles.monthOptionText,
                  { color: Colors[activeTheme].text },
                ]}
              >
                May 2024
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardGradient: {
    borderRadius: 16,
    padding: 16,
  },
  totalSavingsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  totalSavingsItem: {
    flex: 1,
  },
  totalSavingsLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  totalSavingsValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  pieChartCenter: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  pieChartTotal: {
    fontSize: 18,
    fontWeight: "bold",
  },
  pieChartLabel: {
    fontSize: 12,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendAmount: {
    fontSize: 12,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.secondaryLight,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  monthText: {
    fontSize: 14,
    marginRight: 4,
  },
  amountContainer: {
    marginTop: 16,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: "bold",
  },
  rateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  rateText: {
    fontSize: 14,
    marginLeft: 4,
  },
  loadingContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  breakdownCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  trendCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  trendHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  trendTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  trendButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  trendButtonText: {
    fontSize: 14,
  },
  goalsCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  goalsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  goalsTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  addGoalButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  addGoalText: {
    fontSize: 14,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  monthOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  monthOptionText: {
    fontSize: 16,
    textAlign: "center",
  },

  timeframeSelector: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: Colors.light.secondary,
    borderRadius: 25,
    padding: 4,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
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
    fontWeight: "600",
  },
  chartContainer: {
    height: 180,
    marginTop: 16,
    flexDirection: "row",
  },
  chartYAxis: {
    width: 40,
    height: 150,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 8,
  },
  chartYLabel: {
    fontSize: 10,
    color: Colors.light.textSecondary,
  },
  chart: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 150,
  },
  barWrapper: {
    alignItems: "center",
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

  breakdownHeader: {
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  breakdownSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  pieChartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  pieChart: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.secondaryLight,
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
    fontWeight: "600",
    color: Colors.light.text,
  },

  lineChartContainer: {
    height: 150,
  },
  lineChart: {
    height: 120,
    position: "relative",
  },
  lineChartLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 60,
    height: 2,
    backgroundColor: Colors.light.primary,
    borderRadius: 1,
  },
  lineChartDot: {
    position: "absolute",
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  xAxisLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },

  goalItem: {
    marginBottom: 16,
  },
  goalTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  goalIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
  },
  goalProgress: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  goalPercentage: {
    fontSize: 16,
    fontWeight: "bold",
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
