import React, { useEffect, useState, useRef } from 'react';
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
  RefreshControl,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} from '../../redux/slices/expenseSlice';
import { fetchHotels } from '../../redux/slices/hotelSlice';

const paymentModes = ['Cash', 'Card', 'UPI', 'Bank Transfer'];

const VALIDATION_RULES = {
  hotel_id: { required: true },
  title: { required: true, minLength: 2, maxLength: 100 },
  amount: { required: true, pattern: /^\d+(\.\d{1,2})?$/ },
  payment_mode: { required: true },
  expense_date: { required: true },
  notes: { required: false, maxLength: 200 },
};

// TableView Component for Expenses
const TableView = ({ data, hotels, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const scrollViewRef = useRef(null);
  
  return (
    <View style={styles.tableContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        ref={scrollViewRef}
      >
        <View>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: 180 }]}>Title</Text>
            <Text style={[styles.tableHeaderCell, { width: 120 }]}>Hotel</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>Amount</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>Mode</Text>
            <Text style={[styles.tableHeaderCell, { width: 120 }]}>Date</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>Actions</Text>
          </View>
          
          {/* Table Content */}
          <View>
            {data.map((item, index) => (
              <View key={item?.id ? item.id.toString() : index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: 180 }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={[styles.tableCell, { width: 120 }]} numberOfLines={1}>
                  {hotels.find(h => String(h.id) === String(item.hotel_id))?.name || 'Unknown'}
                </Text>
                <Text style={[styles.tableCell, { width: 100, color: '#fe8c06', fontFamily: 'Poppins-Bold' }]}>
                  ₹{item.amount}
                </Text>
                <Text style={[styles.tableCell, { width: 100 }]} numberOfLines={1}>
                  {item.payment_mode}
                </Text>
                <Text style={[styles.tableCell, { width: 120 }]} numberOfLines={1}>
                  {item.expense_date}
                </Text>
                <View style={[styles.tableActions, { width: 100 }]}>
                  <TouchableOpacity onPress={() => onEdit(item)}>
                    <Ionicons name="create-outline" size={20} color="#1c2f87" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onDelete(item.id)}>
                    <Ionicons name="trash-outline" size={20} color="#fe8c06" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default function ExpenseEntryScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { expenses } = useSelector(state => state.expense);
  const { hotels } = useSelector(state => state.hotel);

  const [form, setForm] = useState({
    hotel_id: '',
    title: '',
    amount: '',
    payment_mode: '',
    expense_date: '',
    notes: '',
    document: '',
    added_by: 'Admin',
  });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isTableView, setIsTableView] = useState(false);

  useEffect(() => {
    dispatch(fetchExpenses());
    dispatch(fetchHotels());
  }, [dispatch]);

  const validateForm = () => {
    const newErrors = {};
    Object.keys(VALIDATION_RULES).forEach(field => {
      const value = form[field];
      const rules = VALIDATION_RULES[field];
      if (rules.required && (!value || String(value).trim() === '')) {
        newErrors[field] = `${field
          .replace('_', ' ')
          .replace(/\b\w/g, l => l.toUpperCase())} is required`;
        return;
      }
      if (value && String(value).trim() !== '') {
        if (rules.minLength && value.length < rules.minLength) {
          newErrors[field] = `${field
            .replace('_', ' ')
            .replace(/\b\w/g, l => l.toUpperCase())} must be at least ${
            rules.minLength
          } characters`;
        } else if (rules.maxLength && value.length > rules.maxLength) {
          newErrors[field] = `${field
            .replace('_', ' ')
            .replace(/\b\w/g, l => l.toUpperCase())} must be less than ${
            rules.maxLength
          } characters`;
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

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const d = selectedDate;
      const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(d.getDate()).padStart(2, '0')}`;
      handleChange('expense_date', formatted);
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    const expenseData = {
      ...form,
      amount: parseFloat(form.amount), // Ensure amount is a number
    };

    if (editId) {
      dispatch(updateExpense({ ...expenseData, id: editId })).then(() => {
        closeForm();
        dispatch(fetchExpenses());
      });
    } else {
      dispatch(addExpense(expenseData)).then(() => {
        closeForm();
        dispatch(fetchExpenses());
      });
    }
  };

  const handleEdit = expense => {
    setForm(expense);
    setEditId(expense.id);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = id => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteExpense(id)).then(() => dispatch(fetchExpenses()));
          },
        },
      ],
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchExpenses());
    setRefreshing(false);
  };

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
      document: '',
      added_by: 'Admin',
    });
  };

  const renderDropdown = (field, label, options, getLabel = i => i) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.dropdown, errors[field] && styles.inputError]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {options.map(option => (
            <TouchableOpacity
              key={option.id || option}
              style={[
                styles.dropdownOption,
                String(form[field]) === String(option.id || option) &&
                  styles.dropdownOptionSelected,
              ]}
              onPress={() => handleChange(field, String(option.id || option))}
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  String(form[field]) === String(option.id || option) &&
                    styles.dropdownOptionTextSelected,
                ]}
              >
                {getLabel(option)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

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

  const renderDatePicker = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Expense Date</Text>
      <TouchableOpacity
        style={[
          styles.input,
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          },
          errors.expense_date && styles.inputError,
        ]}
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
      {errors.expense_date && (
        <Text style={styles.errorText}>{errors.expense_date}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>{t('Expenses')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewToggleBtn}
            onPress={() => setIsTableView(!isTableView)}
          >
            <Ionicons 
              name={isTableView ? "list-outline" : "grid-outline"} 
              size={22} 
              color="#1c2f87" 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowForm(true)}
          >
            <Ionicons name="add" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {isTableView ? (
        <ScrollView
          contentContainerStyle={styles.tableScrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#1c2f87']}
              tintColor="#1c2f87"
            />
          }
        >
          <TableView 
            data={expenses}
            hotels={hotels}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          {expenses.length === 0 && (
            <Text style={styles.emptyText}>{t('No expenses added yet.')}</Text>
          )}
        </ScrollView>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={item =>
            item?.id ? item.id.toString() : Math.random().toString()
          }
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          renderItem={({ item }) => (
            <View style={styles.expenseCard}>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseTitle}>{item.title}</Text>
                <Text style={styles.expenseDetails}>
                  {hotels.find(h => String(h.id) === String(item.hotel_id))
                    ?.name || 'Unknown'}{' '}
                  • {item.payment_mode} • ₹{item.amount}
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
      )}

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
              {renderDropdown('hotel_id', 'Select Hotel', hotels, h => h.name)}
              {renderInput('title', 'Title', 'Enter expense title')}
              {renderInput('amount', 'Amount', 'Enter amount', {
                keyboardType: 'numeric',
              })}
              {renderDropdown('payment_mode', 'Payment Mode', paymentModes)}
              {renderDatePicker()}
              {renderInput('notes', 'Notes', 'Enter notes (optional)', {
                multiline: true,
                numberOfLines: 3,
              })}
              <View style={styles.formBtnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={closeForm}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSubmit}
                >
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewToggleBtn: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    padding: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
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
  // New styles for TableView
  tableContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1c2f87',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#e9ecef',
    paddingVertical: 12,
    paddingHorizontal: 4,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  tableCell: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    textAlign: 'center',
    color: '#495057',
    paddingHorizontal: 4,
  },
  tableActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  tableScrollView: {
    flexGrow: 1,
  },
});
