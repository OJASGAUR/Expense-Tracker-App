import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../utils/api';
import { format } from 'date-fns';
import { useTheme } from '../context/ThemeContext';
import { createGlobalStyles } from '../styles/global';
import { useNavigation } from '@react-navigation/native';

const Dashboard = () => {
  const { colors, isDarkMode } = useTheme();
  const globalStyles = createGlobalStyles({ ...colors, isDarkMode });
  
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    accountCount: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const fetchDashboardData = async () => {
    try {
      const [accountsRes, transactionsRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/transactions'),
      ]);

      const accounts = accountsRes.data;
      const transactions = transactionsRes.data.slice(0, 5);

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const monthTransactions = transactionsRes.data.filter((t) => {
        const date = new Date(t.createdAt);
        return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
      });

      const totalIncome = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const balance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

      setStats({
        totalIncome,
        totalExpense,
        balance,
        accountCount: accounts.length,
      });

      setRecentTransactions(transactions);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'income':
        return <Ionicons name="arrow-up-circle" size={24} color={colors.success} />;
      case 'expense':
        return <Ionicons name="arrow-down-circle" size={24} color={colors.danger} />;
      case 'transfer':
        return <Ionicons name="swap-horizontal" size={24} color={colors.primary} />;
      default:
        return null;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'income':
        return colors.success;
      case 'expense':
        return colors.danger;
      case 'transfer':
        return colors.primary;
      default:
        return colors.gray;
    }
  };

  if (loading) {
    return (
      <View style={[globalStyles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const statCards = [
    {
      title: 'Total Balance',
      value: `₹${stats.balance.toFixed(2)}`,
      icon: 'wallet',
      color: colors.primary,
    },
    {
      title: 'This Month Income',
      value: `₹${stats.totalIncome.toFixed(2)}`,
      icon: 'trending-up',
      color: colors.success,
    },
    {
      title: 'This Month Expense',
      value: `₹${stats.totalExpense.toFixed(2)}`,
      icon: 'trending-down',
      color: colors.danger,
    },
    {
      title: 'Total Accounts',
      value: stats.accountCount.toString(),
      icon: 'wallet',
      color: '#8b5cf6',
    },
  ];

  return (
    <ScrollView style={[globalStyles.container, { backgroundColor: colors.background }]}>

      <View style={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <View key={index} style={[globalStyles.card, styles.statCard]}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}20` }]}>
                <Ionicons name={stat.icon} size={24} color={stat.color} />
              </View>
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
            <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{stat.title}</Text>
          </View>
        ))}
      </View>

      <View style={globalStyles.card}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={[styles.viewAllText, { color: colors.primary }]}>View all</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={colors.grayLight} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No transactions yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Start by adding your first transaction!</Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {recentTransactions.map((transaction) => (
              <View key={transaction.id} style={[styles.transactionItem, { backgroundColor: colors.background }]}>
                <View style={styles.transactionLeft}>
                  <View style={[styles.transactionIcon, { backgroundColor: `${getTransactionColor(transaction.type)}20` }]}>
                    {getTransactionIcon(transaction.type)}
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={[styles.transactionNote, { color: colors.text }]}>
                      {transaction.note || `${transaction.type} transaction`}
                    </Text>
                    <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
                      {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                    </Text>
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[styles.transactionAmount, { color: getTransactionColor(transaction.type) }]}>
                    {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                  </Text>
                  <Text style={[styles.transactionType, { color: colors.textSecondary }]}>{transaction.type}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 16,
  },
  statHeader: {
    marginBottom: 12,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionNote: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  transactionType: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
});

export default Dashboard;
