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
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';
import { format } from 'date-fns';
import { useTheme } from '../context/ThemeContext';
import { createGlobalStyles } from '../styles/global';

const Transactions = () => {
  const { colors, isDarkMode } = useTheme();
  const globalStyles = createGlobalStyles({ ...colors, isDarkMode });
  
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    note: '',
    accountId: '',
    categoryId: '',
    toAccountId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState('all');

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      const [transactionsRes, accountsRes, categoriesRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/accounts'),
        api.get('/categories'),
      ]);

      setTransactions(transactionsRes.data);
      setAccounts(accountsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (formData.type !== 'transfer' && !formData.accountId) {
      Alert.alert('Error', 'Please select an account');
      return;
    }

    if (formData.type === 'transfer' && (!formData.accountId || !formData.toAccountId)) {
      Alert.alert('Error', 'Please select both accounts for transfer');
      return;
    }

    if (formData.type !== 'transfer' && !formData.categoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        note: formData.note || null,
        accountId: formData.accountId,
        categoryId: formData.categoryId || null,
        ...(formData.type === 'transfer' && { toAccountId: formData.toAccountId }),
      };

      await api.post('/transactions', payload);
      setShowModal(false);
      setFormData({
        amount: '',
        type: 'expense',
        note: '',
        accountId: '',
        categoryId: '',
        toAccountId: '',
      });
      fetchData();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/transactions/${id}`);
              fetchData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
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

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  // Refresh data when modal opens to ensure latest accounts/categories
  const handleOpenModal = () => {
    fetchData();
    setShowModal(true);
  };

  if (loading) {
    return (
      <View style={[globalStyles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const styles = StyleSheet.create({
    addButton: {
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterTabs: {
      marginBottom: 16,
    },
    filterTab: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 8,
      borderRadius: 20,
    },
    filterTabActive: {
      backgroundColor: colors.primary,
    },
    filterTabText: {
      fontSize: 14,
      fontWeight: '600',
    },
    filterTabTextActive: {
      color: colors.white,
    },
    transactionsList: {
      gap: 12,
    },
    transactionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
      marginBottom: 4,
    },
    transactionMeta: {
      flexDirection: 'row',
    },
    transactionMetaText: {
      fontSize: 12,
    },
    transactionRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    transactionAmount: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 48,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: 16,
    },
    emptySubtext: {
      fontSize: 14,
      marginTop: 4,
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
      backgroundColor: colors.card,
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
    typeButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    typeButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    typeButtonSelected: {
      borderWidth: 2,
    },
    typeButtonText: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: '600',
    },
    pickerContainer: {
      padding: 0,
    },
    picker: {
      height: 50,
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

  return (
    <ScrollView style={[globalStyles.container, { backgroundColor: colors.background }]}>

      <TouchableOpacity
        style={[globalStyles.button, styles.addButton]}
        onPress={handleOpenModal}
      >
        <Ionicons name="add" size={20} color={colors.white} style={{ marginRight: 8 }} />
        <Text style={globalStyles.buttonText}>Add Transaction</Text>
      </TouchableOpacity>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
        {['all', 'income', 'expense', 'transfer'].map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setFilterType(type)}
            style={[
              styles.filterTab,
              {
                backgroundColor: filterType === type ? colors.primary : colors.grayLight,
              },
            ]}
          >
            <Text
              style={[
                styles.filterTabText,
                {
                  color: filterType === type ? colors.white : colors.textSecondary,
                },
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredTransactions.length === 0 ? (
        <View style={[globalStyles.card, styles.emptyState]}>
          <Ionicons name="receipt-outline" size={64} color={colors.grayLight} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No transactions yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Add your first transaction!</Text>
        </View>
      ) : (
        <View style={styles.transactionsList}>
          {filteredTransactions.map((transaction) => {
            const account = accounts.find((a) => a.id === transaction.accountId);
            const category = categories.find((c) => c.id === transaction.categoryId);

            return (
              <View key={transaction.id} style={globalStyles.card}>
                <View style={styles.transactionRow}>
                  <View style={styles.transactionLeft}>
                    <View style={[styles.transactionIcon, { backgroundColor: `${getTransactionColor(transaction.type)}20` }]}>
                      {getTransactionIcon(transaction.type)}
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={[styles.transactionNote, { color: colors.text }]}>
                        {transaction.note || `${transaction.type} transaction`}
                      </Text>
                      <View style={styles.transactionMeta}>
                        <Text style={[styles.transactionMetaText, { color: colors.textSecondary }]}>
                          {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                        </Text>
                        {account && (
                          <Text style={[styles.transactionMetaText, { color: colors.textSecondary }]}> • {account.name}</Text>
                        )}
                        {category && (
                          <Text style={[styles.transactionMetaText, { color: colors.textSecondary }]}> • {category.name}</Text>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={[styles.transactionAmount, { color: getTransactionColor(transaction.type) }]}>
                      {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                    </Text>
                    <TouchableOpacity onPress={() => handleDelete(transaction.id)}>
                      <Ionicons name="trash-outline" size={20} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
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
          <ScrollView style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Transaction</Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Transaction Type</Text>
              <View style={styles.typeButtons}>
                {['income', 'expense', 'transfer'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      formData.type === type && styles.typeButtonSelected,
                      formData.type === type && {
                        backgroundColor:
                          type === 'income'
                            ? `${colors.success}20`
                            : type === 'expense'
                            ? `${colors.danger}20`
                            : `${colors.primary}20`,
                      },
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, type, categoryId: '', toAccountId: '' });
                    }}
                  >
                    {getTransactionIcon(type)}
                    <Text
                      style={[
                        styles.typeButtonText,
                        formData.type === type && {
                          color:
                            type === 'income'
                              ? colors.success
                              : type === 'expense'
                              ? colors.danger
                              : colors.primary,
                        },
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
                <Text style={[styles.label, { color: colors.text }]}>
                {formData.type === 'transfer' ? 'From Account' : 'Account'}
              </Text>
              {accounts.length === 0 ? (
                <View style={[styles.emptyPicker, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.emptyPickerText, { color: colors.textSecondary }]}>No accounts available. Please create an account first.</Text>
                </View>
              ) : (
                <View style={[globalStyles.input, styles.pickerContainer]}>
                  <Picker
                    selectedValue={formData.accountId}
                    onValueChange={(value) => setFormData({ ...formData, accountId: value })}
                    style={[styles.picker, { color: colors.text }]}
                    dropdownIconColor={colors.textSecondary}
                  >
                    <Picker.Item label="Select account" value="" />
                    {accounts.map((account) => (
                      <Picker.Item
                        key={account.id}
                        label={`${account.icon || '💰'} ${account.name}`}
                        value={account.id}
                      />
                    ))}
                  </Picker>
                </View>
              )}
            </View>

            {formData.type === 'transfer' && (
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>To Account</Text>
                {accounts.filter((a) => a.id !== formData.accountId).length === 0 ? (
                <View style={[styles.emptyPicker, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.emptyPickerText, { color: colors.textSecondary }]}>No other accounts available for transfer.</Text>
                </View>
                ) : (
                  <View style={[globalStyles.input, styles.pickerContainer]}>
                    <Picker
                      selectedValue={formData.toAccountId}
                      onValueChange={(value) => setFormData({ ...formData, toAccountId: value })}
                      style={styles.picker}
                      dropdownIconColor={colors.grayDark}
                    >
                      <Picker.Item label="Select account" value="" />
                      {accounts
                        .filter((a) => a.id !== formData.accountId)
                        .map((account) => (
                          <Picker.Item
                            key={account.id}
                            label={`${account.icon || '💰'} ${account.name}`}
                            value={account.id}
                          />
                        ))}
                    </Picker>
                  </View>
                )}
              </View>
            )}

            {formData.type !== 'transfer' && (
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Category</Text>
                {(formData.type === 'income' ? incomeCategories : expenseCategories).length === 0 ? (
                <View style={[styles.emptyPicker, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.emptyPickerText, { color: colors.textSecondary }]}>
                      No {formData.type} categories available. Please create a category first.
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
                      {(formData.type === 'income' ? incomeCategories : expenseCategories).map(
                        (category) => (
                          <Picker.Item
                            key={category.id}
                            label={`${category.icon || '📁'} ${category.name}`}
                            value={category.id}
                          />
                        )
                      )}
                    </Picker>
                  </View>
                )}
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Note (Optional)</Text>
              <TextInput
                style={globalStyles.input}
                value={formData.note}
                onChangeText={(text) => setFormData({ ...formData, note: text })}
                placeholder="Add a note..."
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[globalStyles.buttonSecondary, { flex: 1, marginRight: 8 }]}
                onPress={() => {
                  setShowModal(false);
                  setFormData({
                    amount: '',
                    type: 'expense',
                    note: '',
                    accountId: '',
                    categoryId: '',
                    toAccountId: '',
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

export default Transactions;
