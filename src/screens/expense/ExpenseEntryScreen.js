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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import DropdownField from '../../components/DropdownField';



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
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>
              Actions
            </Text>
          </View>

          {/* Table Content */}
          <View>
            {data.map((item, index) => (
              <View
                key={item?.id ? item.id.toString() : index}
                style={styles.tableRow}
              >
                <Text
                  style={[styles.tableCell, { width: 180 }]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                <Text
                  style={[styles.tableCell, { width: 120 }]}
                  numberOfLines={1}
                >
                  {hotels.find(h => String(h.id) === String(item.hotel_id))
                    ?.name || 'Unknown'}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    {
                      width: 100,
                      color: '#fe8c06',
                      fontFamily: 'Poppins-Bold',
                    },
                  ]}
                >
                  ₹{item.amount}
                </Text>
                <Text
                  style={[styles.tableCell, { width: 100 }]}
                  numberOfLines={1}
                >
                  {item.payment_mode}
                </Text>
                <Text
                  style={[styles.tableCell, { width: 120 }]}
                  numberOfLines={1}
                >
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
  const insets = useSafeAreaInsets();
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
    added_by: 2,
  });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isTableView, setIsTableView] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    hotel_name: '',
    mode: '',
    from_date: '',
    to_date: '',
  });
  const [showExpenseDatePicker, setShowExpenseDatePicker] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  useEffect(() => {
    dispatch(fetchExpenses({}));
    dispatch(fetchHotels());
  }, [dispatch]);

  // Remove client-side filtering
  // const filteredExpenses = expenses.filter(...)

  const handleExpenseDateChange = (event, selectedDate) => {
    setShowExpenseDatePicker(false);
    if (selectedDate) {
      const d = selectedDate;
      const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(d.getDate()).padStart(2, '0')}`;
      handleFilterChange('expense_date', formatted);
    }
  };
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
            .replace(/\b\w/g, l => l.toUpperCase())} must be at least ${rules.minLength
            } characters`;
        } else if (rules.maxLength && value.length > rules.maxLength) {
          newErrors[field] = `${field
            .replace('_', ' ')
            .replace(/\b\w/g, l => l.toUpperCase())} must be less than ${rules.maxLength
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

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
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

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      const d = selectedDate;
      const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(d.getDate()).padStart(2, '0')}`;
      handleFilterChange('start_date', formatted);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      const d = selectedDate;
      const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(d.getDate()).padStart(2, '0')}`;
      handleFilterChange('end_date', formatted);
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
    await dispatch(fetchExpenses(filters));
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
      added_by: 2,
    });
  };

  const clearFilters = () => {
    setFilters({
      hotel_name: '',
      mode: '',
      from_date: '',
      to_date: '',
    });
    setShowFilterModal(false);
    dispatch(fetchExpenses({}));
  };

  const applyFilters = () => {
    setShowFilterModal(false);
    dispatch(fetchExpenses(filters));
  };

  const paymentModes = ['Cash', 'Card', 'UPI', 'Bank Transfer'];

  // Change renderPaymentDropdown function:
  const renderPaymentDropdown = (field, placeholder, data) => (
    <View style={styles.formField}>
      <Text style={styles.label}>{placeholder}</Text>
      <DropdownField
        label="Payment Modes"
        placeholder={placeholder}
        value={form[field]}
        // Convert string array to value/label objects
        options={data.map(mode => ({ value: mode, label: mode }))}
        onSelect={item => handleChange(field, item.value)}
      />
    </View>
  );

  const renderHotelDropdown = (field, placeholder, data, getLabel) => (
    <View style={styles.formField}>
      <Text style={styles.label}>{placeholder}</Text>
      <DropdownField
        label="Hotels"
        placeholder={placeholder}
        value={form[field]}
        options={data.map(item => ({
          value: item.id || item.name,
          label: getLabel ? getLabel(item) : item.label,
        }))}
        onSelect={item => handleChange(field, item.value)}
      />
    </View>
  );

  const renderFilterDropdown = (field, label, options, getLabel = i => i) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.dropdown}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {options.map(option => (
            <TouchableOpacity
              key={option.id || option}
              style={[
                styles.dropdownOption,
                String(filters[field]) === String(option.id || option) &&
                styles.dropdownOptionSelected,
              ]}
              onPress={() =>
                handleFilterChange(field, String(option.id || option))
              }
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  String(filters[field]) === String(option.id || option) &&
                  styles.dropdownOptionTextSelected,
                ]}
              >
                {getLabel(option)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
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

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color="#1c2f87" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Hotel Dropdown */}
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Hotel</Text>
              <DropdownField
                placeholder="Select Hotel"
                value={filters.hotel_name}
                options={[
                  { value: '', label: 'All Hotels' },
                  ...hotels.map(hotel => ({
                    value: hotel.name,
                    label: hotel.name,
                  })),
                ]}
                onSelect={item => handleFilterChange('hotel_name', item.value)}
              />
            </View>

            {/* Payment Mode Dropdown */}
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Payment Mode</Text>
              <DropdownField
                placeholder="Select Payment Mode"
                value={filters.mode}
                options={[
                  { value: '', label: 'All Modes' },
                  // Map string array to value/label objects
                  ...paymentModes.map(mode => ({ value: mode, label: mode })),
                ]}
                onSelect={item => handleFilterChange('mode', item.value)}
              />
            </View>

            {/* From Date Picker */}
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>From Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowFromDatePicker(true)}
              >
                <Text style={filters.from_date ? styles.dateInputText : styles.dateInputPlaceholder}>
                  {filters.from_date || 'Select From Date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#fe8c06" />
              </TouchableOpacity>
            </View>
            {showFromDatePicker && (
              <DateTimePicker
                value={filters.from_date ? new Date(filters.from_date) : new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowFromDatePicker(false);
                  if (date) {
                    const formattedDate = date.toISOString().split('T')[0];
                    handleFilterChange('from_date', formattedDate);
                  }
                }}
              />
            )}

            {/* To Date Picker */}
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>To Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowToDatePicker(true)}
              >
                <Text style={filters.to_date ? styles.dateInputText : styles.dateInputPlaceholder}>
                  {filters.to_date || 'Select To Date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#fe8c06" />
              </TouchableOpacity>
            </View>
            {showToDatePicker && (
              <DateTimePicker
                value={filters.to_date ? new Date(filters.to_date) : new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowToDatePicker(false);
                  if (date) {
                    const formattedDate = date.toISOString().split('T')[0];
                    handleFilterChange('to_date', formattedDate);
                  }
                }}
                minimumDate={filters.from_date ? new Date(filters.from_date) : undefined}
              />
            )}

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.clearFilterButton]}
                onPress={clearFilters}
              >
                <Text style={styles.clearFilterButtonText}>Clear Filters</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.applyButton]}
                onPress={applyFilters}
              >
                <Text style={styles.modalButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>{t('Expenses')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons
              name="filter"
              size={22}
              color={showFilters ? '#fe8c06' : '#1c2f87'}
            />
            {Object.values(filters).some(val => val !== '') && (
              <View style={styles.filterBadge} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.viewToggleBtn}
            onPress={() => setIsTableView(!isTableView)}
          >
            <Ionicons
              name={isTableView ? 'list-outline' : 'grid-outline'}
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
          contentContainerStyle={[styles.tableScrollView, { paddingBottom: 120 }]}
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
            <Text style={styles.emptyText}>{t('No expenses found.')}</Text>
          )}
        </ScrollView>
      ) : (
        <>
          <FlatList
            data={expenses}
            keyExtractor={item =>
              item?.id ? item.id.toString() : Math.random().toString()
            }
            contentContainerStyle={[styles.listContainer, { paddingBottom: 120 }]}
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
                  <Text style={styles.expenseDate}>
                    Date: {item.expense_date}
                  </Text>
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
              <Text style={styles.emptyText}>{t('No expenses found.')}</Text>
            }
          />
          <View style={styles.totalAmountContainer}>
            <Text style={styles.totalAmountLabel}>Total Expenses:</Text>
            <Text style={styles.totalAmountValue}>
              ₹{expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0).toFixed(2)}
            </Text>
          </View>
        </>
      )}

      {renderFilterModal()}
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
              {renderHotelDropdown('hotel_id', 'Select Hotel', hotels, h => h.name)}
              {renderInput('title', 'Title', 'Enter expense title')}
              {renderInput('amount', 'Amount', 'Enter amount', {
                keyboardType: 'numeric',
              })}
              {renderPaymentDropdown('payment_mode', 'Select Payment Mode', paymentModes)}
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
  filterButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    padding: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
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
  // TableView styles
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
  // Filter styles
  filterButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    padding: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fe8c06',
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  filterHeaderText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1c2f87',
  },
  filterContent: {
    padding: 16,
  },
  filterItem: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#6c757d',
    marginBottom: 6,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
  },
  dateInputText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#1c2f87',
  },
  dateInputPlaceholder: {
    color: '#a0a3bd',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  applyButton: {
    backgroundColor: '#1c2f87',
  },
  clearFilterButton: {
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 8,
  },
  clearFilterButtonText: {
    color: '#1c2f87',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  scrollViewContent: {
    paddingBottom: 60,
  },
  totalAmountContainer: {
    // position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingVertical: 22,
    backgroundColor: '#fff',
    borderTopColor: '#1c2f87',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 5,
  },
  totalAmountLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1c2f87',
  },
  totalAmountValue: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#fe8c06',
  },
  filterItem: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
