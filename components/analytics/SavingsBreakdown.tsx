import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import PieChart from '../charts/PieChart';

interface BreakdownItem {
  category: string;
  amount: string;
  color: string;
}

interface SavingsBreakdownProps {
  data: BreakdownItem[];
  title: string;
  subtitle?: string;
  theme: 'light' | 'dark';
}

const SavingsBreakdown: React.FC<SavingsBreakdownProps> = ({
  data,
  title,
  subtitle,
  theme
}) => {
  // Calculate total amount
  const totalAmount = data.reduce((sum, item) => {
    return sum + parseFloat(item.amount.replace(/,/g, ''));
  }, 0);
  
  const formattedTotal = totalAmount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).replace('$', '');
  
  // Convert to format needed by PieChart
  const pieChartData = data.map(item => ({
    value: parseFloat(item.amount.replace(/,/g, '')),
    color: item.color,
    label: item.category
  }));
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors[theme].text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: Colors[theme].textSecondary }]}>{subtitle}</Text>
        )}
      </View>
      
      <View style={styles.chartAndLegend}>
        <PieChart 
          data={pieChartData}
          size={120}
          centerValue={`$${formattedTotal}`}
          centerLabel="Total"
          theme={theme}
        />
        
        <View style={styles.legendContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View 
                style={[
                  styles.legendDot,
                  { backgroundColor: item.color }
                ]} 
              />
              <View style={styles.legendTextContainer}>
                <Text style={[styles.legendText, { color: Colors[theme].text }]}>{item.category}</Text>
                <Text style={[styles.legendAmount, { color: Colors[theme].textSecondary }]}>${item.amount}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      
      {/* Detailed breakdown */}
      <View style={styles.detailedBreakdown}>
        {data.map((item, index) => (
          <View key={index} style={styles.breakdownItem}>
            <View style={styles.categoryContainer}>
              <View 
                style={[
                  styles.categoryDot,
                  { backgroundColor: item.color }
                ]} 
              />
              <Text style={[styles.categoryName, { color: Colors[theme].text }]}>{item.category}</Text>
            </View>
            <Text style={[styles.categoryAmount, { color: Colors[theme].text }]}>${item.amount}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  chartAndLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  legendContainer: {
    flex: 1,
    marginLeft: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendText: {
    fontSize: 14,
    fontWeight: '500',
  },
  legendAmount: {
    fontSize: 12,
    marginTop: 2,
  },
  detailedBreakdown: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
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
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SavingsBreakdown;
