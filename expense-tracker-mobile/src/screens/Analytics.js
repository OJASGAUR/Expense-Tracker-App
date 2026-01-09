import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, BarChart } from 'react-native-chart-kit';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { createGlobalStyles } from '../styles/global';

const screenWidth = Dimensions.get('window').width;

const Analytics = () => {
  const { colors, isDarkMode } = useTheme();
  const globalStyles = createGlobalStyles({ ...colors, isDarkMode });
  
  const [expenseByCategory, setExpenseByCategory] = useState([]);
  const [incomeByCategory, setIncomeByCategory] = useState([]);
  const [accountAnalysis, setAccountAnalysis] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('income-vs-expense'); // 'income-vs-expense', 'income-by-cat', 'expense-by-cat', 'account-wise'

  useEffect(() => {
    fetchAnalytics();
  }, [selectedMonth, selectedYear]);

  useFocusEffect(
    React.useCallback(() => {
      fetchAnalytics();
    }, [selectedMonth, selectedYear])
  );

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [expenseRes, incomeRes, accountRes, categoriesRes, accountsRes] = await Promise.all([
        api.get(`/analytics/expense-by-category?month=${selectedMonth}&year=${selectedYear}`),
        api.get(`/analytics/income-by-category?month=${selectedMonth}&year=${selectedYear}`),
        api.get(`/analytics/account-analysis?month=${selectedMonth}&year=${selectedYear}`),
        api.get('/categories'),
        api.get('/accounts'),
      ]);

      setExpenseByCategory(expenseRes.data || []);
      setIncomeByCategory(incomeRes.data || []);
      setAccountAnalysis(accountRes.data || []);
      setCategories(categoriesRes.data || []);
      setAccounts(accountsRes.data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      Alert.alert('Error', 'Failed to fetch analytics data');
      setExpenseByCategory([]);
      setIncomeByCategory([]);
      setAccountAnalysis([]);
      setCategories([]);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return months[month - 1];
  };

  // Chart color palettes
  const expenseColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  ];
  const incomeColors = [
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  ];

  // Prepare expense by category data
  const expenseChartData = expenseByCategory.map((item, index) => {
    const category = categories.find((c) => c.id === item.categoryId);
    return {
      name: category?.name || 'Unknown',
      amount: item._sum.amount || 0,
      color: expenseColors[index % expenseColors.length],
      legendFontColor: colors.text,
      legendFontSize: 12,
    };
  });

  // Prepare income by category data
  const incomeChartData = incomeByCategory.map((item, index) => {
    const category = categories.find((c) => c.id === item.categoryId);
    return {
      name: category?.name || 'Unknown',
      amount: item._sum.amount || 0,
      color: incomeColors[index % incomeColors.length],
      legendFontColor: colors.text,
      legendFontSize: 12,
    };
  });

  // Prepare account analysis data
  const accountChartData = accounts.map((account) => {
    const accountData = accountAnalysis.filter((a) => a.accountId === account.id);
    const income = accountData.find((a) => a.type === 'income')?._sum.amount || 0;
    const expense = accountData.find((a) => a.type === 'expense')?._sum.amount || 0;

    return {
      name: account.name,
      income,
      expense,
      net: income - expense,
    };
  });

  // Calculate totals
  const totalIncome = accountChartData.reduce((sum, item) => sum + item.income, 0);
  const totalExpense = accountChartData.reduce((sum, item) => sum + item.expense, 0);
  const netAmount = totalIncome - totalExpense;

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  if (loading) {
    return (
      <View style={[globalStyles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Account-wise bar chart data
  const accountBarData = {
    labels: accountChartData.map((a) => a.name.length > 8 ? a.name.substring(0, 8) + '...' : a.name),
    datasets: [
      {
        data: accountChartData.map((a) => a.income),
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
      },
      {
        data: accountChartData.map((a) => a.expense),
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
      },
    ],
  };

  // Income vs Expense comparison chart data
  const incomeVsExpenseData = {
    labels: ['Income', 'Expense'],
    datasets: [
      {
        data: [totalIncome, totalExpense],
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
      },
    ],
  };

  const tabs = [
    { id: 'income-vs-expense', label: 'Income vs Expense', icon: 'trending-up' },
    { id: 'income-by-cat', label: 'Income by Cat', icon: 'wallet' },
    { id: 'expense-by-cat', label: 'Expense by Cat', icon: 'card' },
    { id: 'account-wise', label: 'Account-wise', icon: 'business' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'income-vs-expense':
        return (
          <View style={globalStyles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trending-up" size={24} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Income vs Expense</Text>
            </View>
            {totalIncome === 0 && totalExpense === 0 ? (
              <View style={styles.emptyChart}>
                <Ionicons name="bar-chart-outline" size={48} color={colors.grayLight} />
                <Text style={[styles.emptyChartText, { color: colors.textSecondary }]}>
                  No data for {getMonthName(selectedMonth)} {selectedYear}
                </Text>
              </View>
            ) : (
              <>
                <BarChart
                  data={incomeVsExpenseData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={{
                    backgroundColor: colors.card,
                    backgroundGradientFrom: colors.card,
                    backgroundGradientTo: colors.card,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(${isDarkMode ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
                    barPercentage: 0.6,
                    style: {
                      borderRadius: 16,
                    },
                  }}
                  showValuesOnTopOfBars
                  fromZero
                  withInnerLines={false}
                />
                <View style={styles.comparisonStats}>
                  <View style={[styles.comparisonStat, { backgroundColor: `${colors.success}15` }]}>
                    <Ionicons name="arrow-up-circle" size={20} color={colors.success} />
                    <Text style={[styles.comparisonLabel, { color: colors.textSecondary }]}>Income</Text>
                    <Text style={[styles.comparisonValue, { color: colors.success }]}>
                      ₹{totalIncome.toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.comparisonStat, { backgroundColor: `${colors.danger}15` }]}>
                    <Ionicons name="arrow-down-circle" size={20} color={colors.danger} />
                    <Text style={[styles.comparisonLabel, { color: colors.textSecondary }]}>Expense</Text>
                    <Text style={[styles.comparisonValue, { color: colors.danger }]}>
                      ₹{totalExpense.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        );

      case 'income-by-cat':
        return (
          <View style={globalStyles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="wallet" size={24} color={colors.success} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Income by Category</Text>
            </View>
            {incomeChartData.length === 0 ? (
              <View style={styles.emptyChart}>
                <Ionicons name="pie-chart-outline" size={48} color={colors.grayLight} />
                <Text style={[styles.emptyChartText, { color: colors.textSecondary }]}>
                  No income data for {getMonthName(selectedMonth)} {selectedYear}
                </Text>
              </View>
            ) : (
              <>
                <PieChart
                  data={incomeChartData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(${isDarkMode ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
                <View style={styles.categoryList}>
                  {incomeChartData.map((item, index) => (
                    <View key={index} style={[styles.categoryItem, { backgroundColor: colors.background }]}>
                      <View style={styles.categoryInfo}>
                        <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
                        <Text style={[styles.categoryName, { color: colors.text }]}>{item.name}</Text>
                      </View>
                      <Text style={[styles.categoryAmount, { color: colors.success }]}>
                        ₹{item.amount.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        );

      case 'expense-by-cat':
        return (
          <View style={globalStyles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="card" size={24} color={colors.danger} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Expenses by Category</Text>
            </View>
            {expenseChartData.length === 0 ? (
              <View style={styles.emptyChart}>
                <Ionicons name="pie-chart-outline" size={48} color={colors.grayLight} />
                <Text style={[styles.emptyChartText, { color: colors.textSecondary }]}>
                  No expense data for {getMonthName(selectedMonth)} {selectedYear}
                </Text>
              </View>
            ) : (
              <>
                <PieChart
                  data={expenseChartData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(${isDarkMode ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
                <View style={styles.categoryList}>
                  {expenseChartData.map((item, index) => (
                    <View key={index} style={[styles.categoryItem, { backgroundColor: colors.background }]}>
                      <View style={styles.categoryInfo}>
                        <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
                        <Text style={[styles.categoryName, { color: colors.text }]}>{item.name}</Text>
                      </View>
                      <Text style={[styles.categoryAmount, { color: colors.danger }]}>
                        ₹{item.amount.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        );

      case 'account-wise':
        return (
          <>
            <View style={globalStyles.card}>
              <View style={styles.sectionHeader}>
                <Ionicons name="business" size={24} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Account-wise Analysis</Text>
              </View>
              {accountChartData.length === 0 || accountChartData.every(a => a.income === 0 && a.expense === 0) ? (
                <View style={styles.emptyChart}>
                  <Ionicons name="bar-chart-outline" size={48} color={colors.grayLight} />
                  <Text style={[styles.emptyChartText, { color: colors.textSecondary }]}>
                    No account data for {getMonthName(selectedMonth)} {selectedYear}
                  </Text>
                </View>
              ) : (
                <>
                  <BarChart
                    data={accountBarData}
                    width={screenWidth - 64}
                    height={240}
                    chartConfig={{
                      backgroundColor: colors.card,
                      backgroundGradientFrom: colors.card,
                      backgroundGradientTo: colors.card,
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(${isDarkMode ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(${isDarkMode ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
                      barPercentage: 0.7,
                      style: {
                        borderRadius: 16,
                      },
                      propsForBackgroundLines: {
                        strokeDasharray: '',
                        stroke: colors.border,
                      },
                    }}
                    verticalLabelRotation={30}
                    showValuesOnTopOfBars
                    fromZero
                    withInnerLines={false}
                  />
                  <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: colors.success }]} />
                      <Text style={[styles.legendText, { color: colors.text }]}>Income</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: colors.danger }]} />
                      <Text style={[styles.legendText, { color: colors.text }]}>Expense</Text>
                    </View>
                  </View>
                </>
              )}
            </View>

            {accountChartData.length > 0 && (
              <View style={globalStyles.card}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Breakdown</Text>
                {accountChartData.map((account, index) => (
                  <View key={index} style={[styles.accountRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.accountName, { color: colors.text }]}>{account.name}</Text>
                    <View style={styles.accountAmounts}>
                      <View style={styles.amountColumn}>
                        <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Income</Text>
                        <Text style={[styles.accountAmount, { color: colors.success }]}>
                          ₹{account.income.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.amountColumn}>
                        <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Expense</Text>
                        <Text style={[styles.accountAmount, { color: colors.danger }]}>
                          ₹{account.expense.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.amountColumn}>
                        <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Net</Text>
                        <Text
                          style={[
                            styles.accountAmount,
                            styles.accountNet,
                            { color: account.net >= 0 ? colors.success : colors.danger },
                          ]}
                        >
                          ₹{account.net.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[globalStyles.container, { backgroundColor: colors.background }]}>

      {/* Date Selectors */}
      <View style={globalStyles.card}>
        <View style={styles.selectorRow}>
          <Ionicons name="calendar" size={20} color={colors.textSecondary} />
          <View style={styles.selectors}>
            <View style={[globalStyles.input, styles.pickerContainer, { flex: 1, marginRight: 8 }]}>
              <Picker
                selectedValue={selectedMonth}
                onValueChange={(value) => setSelectedMonth(value)}
                style={[styles.picker, { color: colors.text }]}
                dropdownIconColor={colors.text}
              >
                {months.map((month) => (
                  <Picker.Item key={month} label={getMonthName(month)} value={month} />
                ))}
              </Picker>
            </View>
            <View style={[globalStyles.input, styles.pickerContainer, { flex: 1 }]}>
              <Picker
                selectedValue={selectedYear}
                onValueChange={(value) => setSelectedYear(value)}
                style={[styles.picker, { color: colors.text }]}
                dropdownIconColor={colors.text}
              >
                {years.map((year) => (
                  <Picker.Item key={year} label={year.toString()} value={year} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      </View>

      {/* Navigation Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
        contentContainerStyle={styles.tabContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={[
              styles.tab,
              activeTab === tab.id && { backgroundColor: colors.primary },
            ]}
          >
            <Ionicons
              name={tab.icon}
              size={14}
              color={activeTab === tab.id ? colors.white : colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab.id ? colors.white : colors.textSecondary,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 16,
    paddingTop: 8,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectors: {
    flex: 1,
    flexDirection: 'row',
  },
  pickerContainer: {
    padding: 0,
  },
  picker: {
    height: 50,
  },
  tabContainer: {
    marginBottom: 12,
    paddingHorizontal: 16,
    maxHeight: 40,
  },
  tabContent: {
    paddingRight: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoryList: {
    marginTop: 16,
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  accountAmounts: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
    justifyContent: 'flex-end',
  },
  amountColumn: {
    alignItems: 'flex-end',
    minWidth: 70,
  },
  amountLabel: {
    fontSize: 10,
    marginBottom: 4,
  },
  accountAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountNet: {
    fontWeight: 'bold',
  },
  emptyChart: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyChartText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  comparisonStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  comparisonStat: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Analytics;
