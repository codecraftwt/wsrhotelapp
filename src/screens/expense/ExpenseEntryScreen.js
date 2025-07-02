import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Modal,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';

const hotels = ['Hotel A', 'Hotel B', 'Hotel C'];
const paymentModes = ['Cash', 'Card', 'UPI', 'Bank Transfer'];

const VALIDATION_RULES = {
  hotel_id: { required: true },
  title: { required: true, minLength: 2, maxLength: 100 },
  amount: { required: true, pattern: /^\d+(\.\d{1,2})?$/ },
  payment_mode: { required: true },
  expense_date: { required: true },
  notes: { required: false, maxLength: 200 },
};

// Temporary data for expenses
const mockExpenses = [
  { id: 1, hotel_id: 'Hotel A', title: 'Groceries', amount: '1200', payment_mode: 'Cash', expense_date: '2024-06-01', notes: 'Vegetables and fruits' },
  { id: 2, hotel_id: 'Hotel B', title: 'Electricity Bill', amount: '3500', payment_mode: 'Bank Transfer', expense_date: '2024-06-02', notes: 'May month bill' },
];

export default function ExpenseEntryScreen() {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState(mockExpenses);
  const [form, setForm] = useState({
    hotel_id: '',
    title: '',
    amount: '',
    payment_mode: '',
    expense_date: '',
    notes: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    Object.keys(VALIDATION_RULES).forEach(field => {
      const value = form[field];
      const rules = VALIDATION_RULES[field];
      if (rules.required && (!value || value.trim() === '')) {
        newErrors[field] = `${field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
        return;
      }
      if (value && value.trim() !== '') {
        if (rules.minLength && value.length < rules.minLength) {
          newErrors[field] = `${field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} must be at least ${rules.minLength} characters`;
        } else if (rules.maxLength && value.length > rules.maxLength) {
          newErrors[field] = `${field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} must be less than ${rules.maxLength} characters`;
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          if (field === 'amount') {
            newErrors[field] = 'Please enter a valid amount (numbers only)';
          }
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form field changes
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle date picker
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const d = selectedDate;
      const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      handleChange('expense_date', formatted);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }
    const expenseData = { ...form };
    if (editId) {
      setExpenses(prev =>
        prev.map(exp =>
          exp.id === editId ? { ...expenseData, id: editId } : exp
        )
      );
    } else {
      setExpenses(prev => [
        ...prev,
        {
          id: prev.length ? Math.max(...prev.map(e => e.id)) + 1 : 1,
          ...expenseData,
        },
      ]);
    }
    closeForm();
  };

  // Handle edit expense
  const handleEdit = exp => {
    setForm({ ...exp });
    setEditId(exp.id);
    setShowForm(true);
    setErrors({});
  };

  // Handle delete expense
  const handleDelete = id => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setExpenses(prev => prev.filter(e => e.id !== id)),
        },
      ],
    );
  };

  // Close form and reset state
  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setErrors({});
    setForm({
      hotel_id: '',
      title: '',
      amount: '',
      payment_mode: '',
      expense_date: '',
      notes: '',
    });
  };

  // Render dropdown
  const renderDropdown = (field, label, options) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.dropdown, errors[field] && styles.inputError]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {options.map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.dropdownOption,
                form[field] === option && styles.dropdownOptionSelected,
              ]}
              onPress={() => handleChange(field, option)}
            >
              <Text style={[
                styles.dropdownOptionText,
                form[field] === option && styles.dropdownOptionTextSelected,
              ]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  // Render text input
  const renderInput = (field, label, placeholder, options = {}) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        style={[styles.input, errors[field] && styles.inputError]}
        onChangeText={text => handleChange(field, text)}
        value={form[field]}
        {...options}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  // Render date picker
  const renderDatePicker = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Expense Date</Text>
      <TouchableOpacity
        style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, errors.expense_date && styles.inputError]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={{ color: form.expense_date ? '#1c2f87' : '#888' }}>
          {form.expense_date ? form.expense_date : 'dd-mm-yyyy'}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#fe8c06" />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={form.expense_date ? new Date(form.expense_date) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}
      {errors.expense_date && <Text style={styles.errorText}>{errors.expense_date}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>{t('Expenses')}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowForm(true)}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Expense List */}
      <FlatList
        data={expenses}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.expenseCard}>
            <View style={styles.expenseInfo}>
              <Text style={styles.expenseTitle}>{item.title}</Text>
              <Text style={styles.expenseDetails}>
                {item.hotel_id} • {item.payment_mode} • ₹{item.amount}
              </Text>
              <Text style={styles.expenseDate}>Date: {item.expense_date}</Text>
              <Text style={styles.expenseNotes}>{item.notes}</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => handleEdit(item)}
                style={styles.iconBtn}
              >
                <Ionicons name="create-outline" size={22} color="#1c2f87" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={styles.iconBtn}
              >
                <Ionicons name="trash-outline" size={22} color="#fe8c06" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t('No expenses added yet.')}</Text>
        }
      />

      {/* Add/Edit Expense Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={closeForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editId ? t('Update Expense') : t('Add Expense')}
              </Text>
              <TouchableOpacity onPress={closeForm}>
                <Ionicons name="close" size={24} color="#1c2f87" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {renderDropdown('hotel_id', 'Select Hotel', hotels)}
              {renderInput('title', 'Title', 'Enter expense title')}
              {renderInput('amount', 'Amount', 'Enter amount', { keyboardType: 'numeric' })}
              {renderDropdown('payment_mode', 'Payment Mode', paymentModes)}
              {renderDatePicker()}
              {renderInput('notes', 'Notes', 'Enter notes (optional)', { multiline: true, numberOfLines: 3 })}
              {/* Form Action Buttons */}
              <View style={styles.formBtnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={closeForm}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                  <Text style={styles.submitBtnText}>
                    {editId ? 'Update' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 2,
    shadowColor: '#1c2f87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    color: '#1c2f87',
    fontFamily: 'Poppins-Bold',
  },
  addBtn: {
    backgroundColor: '#fe8c06',
    borderRadius: 20,
    padding: 6,
    elevation: 2,
  },
  listContainer: {
    padding: 16,
  },
  expenseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#1c2f87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
  },
  expenseDetails: {
    fontSize: 13,
    color: '#fe8c06',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  expenseDate: {
    fontSize: 12,
    color: '#1c2f87',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  expenseNotes: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  iconBtn: {
    marginLeft: 8,
    padding: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontFamily: 'Poppins-Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    width: '92%',
    maxHeight: '90%',
    padding: 18,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    color: '#1c2f87',
    fontFamily: 'Poppins-Bold',
  },
  inputGroup: {
    marginBottom: 10,
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#1c2f87',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
    marginLeft: 4,
  },
  dropdown: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    minHeight: 40,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  dropdownOptionSelected: {
    backgroundColor: '#1c2f87',
    borderColor: '#1c2f87',
  },
  dropdownOptionText: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
  },
  dropdownOptionTextSelected: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },
  formBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    marginBottom: 10,
  },
  cancelBtn: {
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    marginRight: 10,
  },
  cancelBtnText: {
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
  },
  submitBtn: {
    backgroundColor: '#fe8c06',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  submitBtnText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
});
