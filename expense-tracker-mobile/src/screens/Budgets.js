import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { createGlobalStyles } from '../styles/global';

const Budgets = () => {
  const { colors, isDarkMode } = useTheme();
  const globalStyles = createGlobalStyles({ ...colors, isDarkMode });
  
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    categoryId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [budgetsRes, categoriesRes, transactionsRes] = await Promise.all([
        api.get(`/budgets?month=${selectedMonth}&year=${selectedYear}`),
        api.get('/categories'),
        api.get('/transactions'),
      ]);

      setBudgets(budgetsRes.data || []);
      setCategories(categoriesRes.data || []);
      setTransactions(transactionsRes.data || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      Alert.alert('Error', 'Failed to fetch data');
      setBudgets([]);
      setCategories([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!formData.categoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/budgets', {
        ...formData,
        amount: parseFloat(formData.amount),
      });
      setShowModal(false);
      setFormData({
        amount: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        categoryId: '',
      });
      fetchData();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Budget',
      'Are you sure you want to delete this budget?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/budgets/${id}`);
              fetchData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete budget');
            }
          },
        },
      ]
    );
  };

  const calculateSpent = (categoryId) => {
    const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
    const monthEnd = new Date(selectedYear, selectedMonth, 1);

    const categoryTransactions = transactions.filter((t) => {
      const date = new Date(t.createdAt);
      return (
        t.categoryId === categoryId &&
        t.type === 'expense' &&
        date >= monthStart &&
        date < monthEnd
      );
    });

    return categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return months[month - 1];
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  if (loading) {
    return (
      <View style={[globalStyles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const styles = StyleSheet.create({
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
    },
    subtitle: {
      fontSize: 16,
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
    addButton: {
      marginTop: 16,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    budgetsList: {
      gap: 16,
    },
    budgetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    budgetInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    budgetIcon: {
      fontSize: 32,
      marginRight: 12,
    },
    budgetName: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    budgetLabel: {
      fontSize: 12,
    },
    progressContainer: {
      marginBottom: 16,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    progressLabel: {
      fontSize: 12,
    },
    progressAmount: {
      fontSize: 14,
      fontWeight: '600',
    },
    progressBar: {
      height: 8,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
    remainingContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
    },
    remainingLabel: {
      fontSize: 12,
    },
    remainingAmount: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 48,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: '600',
      marginTop: 16,
      textAlign: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      maxHeight: '90%',
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 24,
    },
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
    },
    emptyPicker: {
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
    },
    emptyPickerText: {
      fontSize: 14,
      textAlign: 'center',
    },
    modalButtons: {
      flexDirection: 'row',
      marginTop: 24,
    },
  });

  // Update remainingContainer and modalContent with theme colors
  const remainingContainerStyle = { ...styles.remainingContainer, borderTopColor: colors.border };
  const modalContentStyle = { ...styles.modalContent, backgroundColor: colors.card };

  return (
    <ScrollView style={[globalStyles.container, { backgroundColor: colors.background }]}>

      <View style={globalStyles.card}>
        <View style={styles.selectorRow}>
          <Ionicons name="calendar" size={20} color={colors.gray} />
          <View style={styles.selectors}>
            <View style={[globalStyles.input, styles.pickerContainer, { flex: 1, marginRight: 8 }]}>
              <Picker
                selectedValue={selectedMonth}
                onValueChange={(value) => setSelectedMonth(value)}
                style={styles.picker}
                dropdownIconColor={colors.grayDark}
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
                style={styles.picker}
                dropdownIconColor={colors.grayDark}
              >
                {years.map((year) => (
                  <Picker.Item key={year} label={year.toString()} value={year} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[globalStyles.button, styles.addButton]}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={20} color={colors.white} style={{ marginRight: 8 }} />
        <Text style={globalStyles.buttonText}>Add Budget</Text>
      </TouchableOpacity>

      {budgets.length === 0 ? (
        <View style={[globalStyles.card, styles.emptyState]}>
          <Ionicons name="flag-outline" size={64} color={colors.grayLight} />
          <Text style={styles.emptyText}>
            No budgets set for {getMonthName(selectedMonth)} {selectedYear}
          </Text>
        </View>
      ) : (
        <View style={styles.budgetsList}>
          {budgets.map((budget) => {
            const category = categories.find((c) => c.id === budget.categoryId);
            const spent = calculateSpent(budget.categoryId);
            const remaining = budget.amount - spent;
            const percentage = (spent / budget.amount) * 100;
            const isOverBudget = spent > budget.amount;

            return (
              <View key={budget.id} style={globalStyles.card}>
                <View style={styles.budgetHeader}>
                  <View style={styles.budgetInfo}>
                    <Text style={styles.budgetIcon}>{category?.icon || '📁'}</Text>
                    <View>
                      <Text style={[styles.budgetName, { color: colors.text }]}>{category?.name || 'Unknown'}</Text>
                      <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>Budget</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(budget.id)}>
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Spent</Text>
                    <Text style={[styles.progressAmount, isOverBudget ? { color: colors.danger } : { color: colors.text }]}>
                      ₹{spent.toFixed(2)} / ₹{budget.amount.toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: colors.grayLight }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: isOverBudget
                            ? colors.danger
                            : percentage > 80
                            ? colors.warning
                            : colors.success,
                        },
                      ]}
                    />
                  </View>
                </View>

                <View style={remainingContainerStyle}>
                  <Text style={[styles.remainingLabel, { color: colors.textSecondary }]}>Remaining</Text>
                  <Text
                    style={[
                      styles.remainingAmount,
                      remaining < 0
                        ? { color: colors.danger }
                        : remaining < budget.amount * 0.2
                        ? { color: colors.warning }
                        : { color: colors.success },
                    ]}
                  >
                    ₹{remaining.toFixed(2)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={modalContentStyle}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Budget</Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Category</Text>
              {expenseCategories.length === 0 ? (
                <View style={[styles.emptyPicker, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.emptyPickerText, { color: colors.textSecondary }]}>
                    No expense categories available. Please create an expense category first.
                  </Text>
                </View>
              ) : (
                <View style={[globalStyles.input, styles.pickerContainer]}>
                  <Picker
                    selectedValue={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    style={styles.picker}
                    dropdownIconColor={colors.grayDark}
                  >
                    <Picker.Item label="Select category" value="" />
                    {expenseCategories.map((category) => (
                      <Picker.Item
                        key={category.id}
                        label={`${category.icon || '📁'} ${category.name}`}
                        value={category.id}
                      />
                    ))}
                  </Picker>
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
              <TextInput
                style={globalStyles.input}
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Month</Text>
              <View style={[globalStyles.input, styles.pickerContainer]}>
                <Picker
                  selectedValue={formData.month}
                  onValueChange={(value) => setFormData({ ...formData, month: value })}
                  style={styles.picker}
                >
                  {months.map((month) => (
                    <Picker.Item key={month} label={getMonthName(month)} value={month} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Year</Text>
              <View style={[globalStyles.input, styles.pickerContainer]}>
                <Picker
                  selectedValue={formData.year}
                  onValueChange={(value) => setFormData({ ...formData, year: value })}
                  style={styles.picker}
                >
                  {years.map((year) => (
                    <Picker.Item key={year} label={year.toString()} value={year} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[globalStyles.buttonSecondary, { flex: 1, marginRight: 8 }]}
                onPress={() => {
                  setShowModal(false);
                  setFormData({
                    amount: '',
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear(),
                    categoryId: '',
                  });
                }}
              >
                <Text style={globalStyles.buttonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.button, { flex: 1 }]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={globalStyles.buttonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Budgets;
