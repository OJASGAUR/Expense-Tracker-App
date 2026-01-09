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

const Categories = () => {
  const { colors, isDarkMode } = useTheme();
  const globalStyles = createGlobalStyles({ ...colors, isDarkMode });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', icon: '📁', type: 'expense' });
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchCategories();
    }, [])
  );

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Category name is required');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/categories', formData);
      setShowModal(false);
      setFormData({ name: '', icon: '📁', type: 'expense' });
      fetchCategories();
    } catch (error) {
      Alert.alert('Error', 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/categories/${id}`);
              fetchCategories();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  const commonIcons = ['🍔', '🚗', '🏠', '💊', '👕', '🎮', '📚', '✈️', '🍕', '☕', '💰', '💼'];

  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  if (loading) {
    return (
      <View style={[globalStyles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const styles = StyleSheet.create({
    addButton: {
      marginBottom: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    categoriesList: {
      gap: 12,
    },
    categoryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    categoryInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    categoryIcon: {
      fontSize: 32,
      marginRight: 12,
    },
    categoryName: {
      fontSize: 18,
      fontWeight: '600',
    },
    emptySection: {
      padding: 16,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.card,
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
    typeButtons: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 8,
    },
    typeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: colors.border,
    },
    typeButtonSelected: {
      borderColor: colors.primary,
    },
    typeButtonText: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
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
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}20`,
    },
    iconText: {
      fontSize: 24,
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
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={20} color={colors.white} style={{ marginRight: 8 }} />
        <Text style={globalStyles.buttonText}>Add Category</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="arrow-up-circle" size={24} color={colors.success} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Income Categories</Text>
        </View>
        {incomeCategories.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No income categories yet</Text>
          </View>
        ) : (
          <View style={styles.categoriesList}>
            {incomeCategories.map((category) => (
              <View key={category.id} style={globalStyles.card}>
                <View style={styles.categoryRow}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryIcon}>{category.icon || '📁'}</Text>
                    <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(category.id)}>
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="arrow-down-circle" size={24} color={colors.danger} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Expense Categories</Text>
        </View>
        {expenseCategories.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No expense categories yet</Text>
          </View>
        ) : (
          <View style={styles.categoriesList}>
            {expenseCategories.map((category) => (
              <View key={category.id} style={globalStyles.card}>
                <View style={styles.categoryRow}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryIcon}>{category.icon || '📁'}</Text>
                    <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(category.id)}>
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Category</Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Category Name</Text>
              <TextInput
                style={globalStyles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="e.g., Food, Salary"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Type</Text>
              <View style={styles.typeButtons}>
                <TouchableOpacity
                    style={[
                      styles.typeButton,
                      {
                        borderColor: formData.type === 'income' ? colors.success : colors.border,
                        backgroundColor: formData.type === 'income' ? `${colors.success}20` : 'transparent',
                      },
                    ]}
                  onPress={() => setFormData({ ...formData, type: 'income' })}
                >
                  <Ionicons
                    name="arrow-up-circle"
                    size={24}
                    color={formData.type === 'income' ? colors.success : colors.gray}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      { color: formData.type === 'income' ? colors.success : colors.textSecondary },
                    ]}
                  >
                    Income
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                      styles.typeButton,
                      {
                        borderColor: formData.type === 'expense' ? colors.danger : colors.border,
                        backgroundColor: formData.type === 'expense' ? `${colors.danger}20` : 'transparent',
                      },
                    ]}
                  onPress={() => setFormData({ ...formData, type: 'expense' })}
                >
                  <Ionicons
                    name="arrow-down-circle"
                    size={24}
                    color={formData.type === 'expense' ? colors.danger : colors.gray}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      { color: formData.type === 'expense' ? colors.danger : colors.textSecondary },
                    ]}
                  >
                    Expense
                  </Text>
                </TouchableOpacity>
              </View>
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

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[globalStyles.buttonSecondary, { flex: 1, marginRight: 8 }]}
                onPress={() => {
                  setShowModal(false);
                  setFormData({ name: '', icon: '📁', type: 'expense' });
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

export default Categories;
