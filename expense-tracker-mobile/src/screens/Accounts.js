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
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { createGlobalStyles } from '../styles/global';

const Accounts = () => {
  const { colors, isDarkMode } = useTheme();
  const globalStyles = createGlobalStyles({ ...colors, isDarkMode });
  
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', icon: '💰', initialBalance: '' });
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchAccounts();
    }, [])
  );

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      Alert.alert('Error', 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Account name is required');
      return;
    }

    setSubmitting(true);
    try {
      // Create the account
      const accountResponse = await api.post('/accounts', {
        name: formData.name,
        icon: formData.icon,
      });
      
      const accountId = accountResponse.data.id;
      
      // If initial balance is provided, create an initial transaction
      if (formData.initialBalance && parseFloat(formData.initialBalance) > 0) {
        const initialAmount = parseFloat(formData.initialBalance);
        
        // Get categories to find an income category (or create a default one)
        const categoriesResponse = await api.get('/categories');
        const incomeCategories = categoriesResponse.data.filter((c) => c.type === 'income');
        
        let categoryId = null;
        if (incomeCategories.length > 0) {
          // Use the first income category, or create a default "Initial Balance" category
          categoryId = incomeCategories[0].id;
        } else {
          // Create a default "Initial Balance" income category if none exists
          try {
            const defaultCategory = await api.post('/categories', {
              name: 'Initial Balance',
              icon: '💰',
              type: 'income',
            });
            categoryId = defaultCategory.data.id;
          } catch (error) {
            console.error('Error creating default category:', error);
          }
        }
        
        // Create initial balance transaction
        if (categoryId) {
          await api.post('/transactions', {
            amount: initialAmount,
            type: 'income',
            note: 'Initial balance',
            accountId: accountId,
            categoryId: categoryId,
          });
        }
      }
      
      setShowModal(false);
      setFormData({ name: '', icon: '💰', initialBalance: '' });
      fetchAccounts();
    } catch (error) {
      console.error('Error creating account:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete this account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/accounts/${id}`);
              fetchAccounts();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  const commonIcons = ['💰', '💳', '🏦', '💵', '💸', '💴', '💶', '💷', '💎', '📊'];

  if (loading) {
    return (
      <View style={[globalStyles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[globalStyles.container, { backgroundColor: colors.background }]}>

      <TouchableOpacity
        style={[globalStyles.button, styles.addButton]}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={20} color={colors.white} style={{ marginRight: 8 }} />
        <Text style={globalStyles.buttonText}>Add Account</Text>
      </TouchableOpacity>

      {accounts.length === 0 ? (
        <View style={[globalStyles.card, styles.emptyState]}>
          <Ionicons name="wallet-outline" size={64} color={colors.grayLight} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No accounts yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Create your first account to get started!</Text>
        </View>
      ) : (
        <View style={styles.accountsGrid}>
          {accounts.map((account) => (
            <View key={account.id} style={globalStyles.card}>
              <View style={styles.accountHeader}>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountIcon}>{account.icon || '💰'}</Text>
                  <View style={styles.accountDetails}>
                    <Text style={[styles.accountName, { color: colors.text }]}>{account.name}</Text>
                    <Text style={[styles.accountLabel, { color: colors.textSecondary }]}>Account</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(account.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </TouchableOpacity>
              </View>
              <View style={[styles.balanceContainer, { borderTopColor: colors.border }]}>
                <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Balance</Text>
                <Text style={[styles.balanceAmount, { color: colors.text }]}>
                  ₹{account.balance?.toFixed(2) || '0.00'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Account</Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Account Name</Text>
              <TextInput
                style={globalStyles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="e.g., Cash, Bank Account"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Icon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
                {commonIcons.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    onPress={() => setFormData({ ...formData, icon })}
                    style={[
                      styles.iconButton,
                      {
                        borderColor: formData.icon === icon ? colors.primary : colors.border,
                        backgroundColor: formData.icon === icon ? `${colors.primary}20` : 'transparent',
                      },
                    ]}
                  >
                    <Text style={styles.iconText}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TextInput
                style={globalStyles.input}
                value={formData.icon}
                onChangeText={(text) => setFormData({ ...formData, icon: text })}
                placeholder="Or enter custom emoji"
                maxLength={2}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Initial Balance (Optional)</Text>
              <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                Set the starting balance for this account. Leave empty to start at ₹0.00
              </Text>
              <TextInput
                style={globalStyles.input}
                value={formData.initialBalance}
                onChangeText={(text) => {
                  // Only allow numbers and decimal point
                  const cleaned = text.replace(/[^0-9.]/g, '');
                  setFormData({ ...formData, initialBalance: cleaned });
                }}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[globalStyles.buttonSecondary, { flex: 1, marginRight: 8 }]}
                onPress={() => {
                  setShowModal(false);
                  setFormData({ name: '', icon: '💰', initialBalance: '' });
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
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  addButton: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountsGrid: {
    gap: 16,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  accountLabel: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
  },
  balanceContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
  },
  balanceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
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
    maxHeight: '80%',
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
  hintText: {
    fontSize: 12,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  iconScroll: {
    marginBottom: 8,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  iconButtonSelected: {
    // Colors applied inline
  },
  iconText: {
    fontSize: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 24,
  },
});

export default Accounts;
