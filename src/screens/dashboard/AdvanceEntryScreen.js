import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DropdownField from '../../components/DropdownField';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchHotels,
  fetchHotelEmployees,
} from '../../redux/slices/hotelSlice';
import {
  fetchAllAdvances,
  addAdvance,
  updateAdvance,
  deleteAdvance,
} from '../../redux/slices/advanceSlice';

// Form validation rules
const VALIDATION_RULES = {
  hotel_id: { required: true, minLength: 1, maxLength: 50 },
  employee_id: { required: true, minLength: 1, maxLength: 50 },
  amount: { required: true, pattern: /^\d+$/ },
  reason: { required: true, minLength: 5, maxLength: 200 },
  date: { required: true, minLength: 8, maxLength: 12 },
  type: { required: true },
};

const typeOptions = [
  { value: 'debit', label: 'Debit' },
  { value: 'credit', label: 'Credit' },
];

export default function AdvanceEntryScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Get data from Redux store
  const {
    hotels,
    employees,
    employeesLoading,
    employeesError,
    loading: hotelsLoading,
    error: hotelsError,
  } = useSelector(state => state.hotel);

  const {
    advances,
    loading: advancesLoading,
    error: advancesError,
  } = useSelector(state => state.advance);

  const { user } = useSelector(state => state.auth);

  // Form state
  const [form, setForm] = useState({
    hotel_id: '',
    employee_id: '',
    amount: '',
    reason: '',
    date: '',
    type: 'debit',
  });

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Fetch hotels and advances on component mount
  useEffect(() => {
    dispatch(fetchHotels());
    dispatch(fetchAllAdvances());
  }, [dispatch]);

  // Prepare hotel options for dropdown
  const hotelOptions = hotels.map(hotel => ({
    value: hotel.id,
    label: hotel.name, // Assuming hotel has 'name' property
  }));

  // Prepare employee options for dropdown
  const employeeOptions = employees.map(employee => ({
    value: employee.id,
    label: employee.name, // Assuming employee has 'name' property
  }));

  // Handle hotel selection
  const handleHotelSelect = selectedItem => {
    // Clear previous employee selection
    setForm(prev => ({
      ...prev,
      hotel_id: selectedItem.value,
      employee_id: '',
    }));

    // Clear error if any
    if (errors.hotel_id) {
      setErrors(prev => ({ ...prev, hotel_id: '' }));
    }

    // Fetch employees for the selected hotel
    dispatch(fetchHotelEmployees(selectedItem.value));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    Promise.all([
      dispatch(fetchHotels()),
      dispatch(fetchAllAdvances()),
    ]).finally(() => {
      setRefreshing(false);
    });
  };

  const handleTypeSelect = selectedItem => {
    setForm(prev => ({ ...prev, type: selectedItem.value }));

    // Clear error if any
    if (errors.type) {
      setErrors(prev => ({ ...prev, type: '' }));
    }
  };

  // Form validation function
  const validateForm = () => {
    const newErrors = {};

    Object.keys(VALIDATION_RULES).forEach(field => {
      const value = form[field];
      const rules = VALIDATION_RULES[field];

      // Convert value to string for validation
      const stringValue =
        value !== undefined && value !== null ? String(value) : '';

      // Required field validation
      if (rules.required && (!stringValue || stringValue.trim() === '')) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
        return;
      }

      if (stringValue && stringValue.trim() !== '') {
        // Length validation
        if (rules.minLength && stringValue.length < rules.minLength) {
          newErrors[field] = `${
            field.charAt(0).toUpperCase() + field.slice(1)
          } must be at least ${rules.minLength} characters`;
        } else if (rules.maxLength && stringValue.length > rules.maxLength) {
          newErrors[field] = `${
            field.charAt(0).toUpperCase() + field.slice(1)
          } must be less than ${rules.maxLength} characters`;
        }

        // Pattern validation
        if (rules.pattern && !rules.pattern.test(stringValue)) {
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

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle employee dropdown selection
  const handleEmployeeSelect = selectedItem => {
    setForm(prev => ({ ...prev, employee_id: selectedItem.value }));

    // Clear error when user selects an option
    if (errors.employee_id) {
      setErrors(prev => ({ ...prev, employee_id: '' }));
    }
  };

  // Handle date picker
  const handleDateChange = (event, date) => {
    setShowDatePicker(false);

    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      setForm(prev => ({ ...prev, date: formattedDate }));

      // Clear error when user selects a date
      if (errors.date) {
        setErrors(prev => ({ ...prev, date: '' }));
      }
    }
  };

  // Open date picker
  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  // Handle form submission
  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    const advanceData = {
      hotel_id: form.hotel_id, // Don't trim numbers
      employee_id: form.employee_id, // Don't trim numbers
      amount: form.amount,
      reason: form.reason.trim(), // Only trim actual strings
      date: form.date,
      type: form.type,
      added_by: user.id,
    };

    if (editId) {
      dispatch(updateAdvance({ ...advanceData, id: editId }))
        .unwrap()
        .then(() => {
          closeForm();
        })
        .catch(error => {
          Alert.alert('Error', error || 'Failed to update advance');
        });
    } else {
      dispatch(addAdvance(advanceData))
        .unwrap()
        .then(() => {
          closeForm();
        })
        .catch(error => {
          Alert.alert('Error', error || 'Failed to add advance');
        });
    }
  };

  // Handle edit advance entry
  const handleEdit = entry => {
    setForm({
      hotel_id: entry.hotel_id,
      employee_id: entry.employee_id,
      amount: entry.amount.toString(), // Ensure amount is string for input
      reason: entry.reason,
      date: entry.date,
      type: entry.type || 'debit',
    });
    setEditId(entry.id);
    setShowForm(true);
    setErrors({});

    // Set selected date for date picker if date exists
    if (entry.date) {
      const dateParts = entry.date.split('-');
      if (dateParts.length === 3) {
        setSelectedDate(new Date(dateParts[0], dateParts[1] - 1, dateParts[2]));
      }
    }

    // Fetch employees for the hotel being edited
    if (entry.hotel_id) {
      dispatch(fetchHotelEmployees(entry.hotel_id));
    }
  };

  // Handle delete advance entry
  const handleDelete = id => {
    Alert.alert(
      'Delete Advance Entry',
      'Are you sure you want to delete this advance entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteAdvance(id))
              .unwrap()
              .catch(error => {
                Alert.alert('Error', error || 'Failed to delete advance');
              });
          },
        },
      ],
    );
  };

  // Close form and reset state
  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setErrors({});
    setSelectedDate(new Date());
    setForm({
      hotel_id: '',
      employee_id: '',
      amount: '',
      reason: '',
      date: '',
    });
  };

  // Render form input with validation
  const renderInput = (field, placeholder, options = {}) => (
    <View key={field}>
      <TextInput
        placeholder={placeholder}
        style={[styles.input, errors[field] && styles.inputError]}
        onChangeText={text => {
          // For amount field, remove non-numeric characters
          if (field === 'amount') {
            const numericValue = text.replace(/[^0-9]/g, '');
            handleChange(field, numericValue);
          } else {
            handleChange(field, text);
          }
        }}
        value={form[field]}
        {...options}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  // Render employee dropdown with different states
  const renderEmployeeDropdown = () => {
    if (employeesLoading) {
      return (
        <View style={styles.dropdownLoading}>
          <ActivityIndicator size="small" color="#1c2f87" />
          <Text style={styles.dropdownLoadingText}>Loading employees...</Text>
        </View>
      );
    }

    if (!form.hotel_id) {
      return (
        <View style={styles.dropdownDisabled}>
          <Text style={styles.dropdownDisabledText}>
            Please select a hotel first
          </Text>
        </View>
      );
    }

    if (employeeOptions.length === 0) {
      return (
        <View style={styles.dropdownDisabled}>
          <Text style={styles.dropdownDisabledText}>
            No employees found in selected hotel
          </Text>
        </View>
      );
    }

    return (
      <DropdownField
        key="employee_id"
        label="Select Employee"
        placeholder="Choose an employee"
        value={form.employee_id}
        options={employeeOptions}
        onSelect={handleEmployeeSelect}
        error={errors.employee_id}
      />
    );
  };

  // Render date input with calendar icon
  const renderDateInput = () => (
    <View>
      <View
        style={[styles.dateInputContainer, errors.date && styles.inputError]}
      >
        <TextInput
          placeholder="Select Date"
          style={styles.dateInput}
          value={form.date}
          editable={false}
          placeholderTextColor="#a0a3bd"
        />
        <TouchableOpacity
          style={styles.calendarIcon}
          onPress={openDatePicker}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={22} color="#1c2f87" />
        </TouchableOpacity>
      </View>
      {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
    </View>
  );

  // Find hotel and employee names for display
  const getDisplayName = (id, options) => {
    const item = options.find(opt => opt.value === id);
    return item ? item.label : 'Unknown';
  };

  if (advancesLoading || hotelsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1c2f87" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>{t('Employee Advances')}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowForm(true)}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Advance Entries List */}
      <FlatList
        data={advances}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1c2f87']} // Customize the loading indicator color
            tintColor="#1c2f87" // iOS only
          />
        }
        renderItem={({ item }) => (
          <View style={styles.entryCard}>
            <View style={styles.entryInfo}>
              <Text style={styles.entryTitle}>{item.employee_name}</Text>
              <Text style={styles.entryHotel}>{item.hotel_name}</Text>
              <Text
                style={[
                  styles.entryAmount,
                  item.type === 'Debit'
                    ? styles.debitAmount
                    : styles.creditAmount,
                ]}
              >
                {item.type === 'Debit'
                  ? `-₹${item.amount}`
                  : `+₹${item.amount}`}
              </Text>
              <Text style={styles.entryReason}>{item.reason}</Text>
              <Text style={styles.entryDate}>{item.date}</Text>
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
          <Text style={styles.emptyText}>No advance entries added yet.</Text>
        }
      />

      {/* Add/Edit Advance Entry Modal */}
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
                {editId ? 'Update Advance Entry' : 'Add Advance Entry'}
              </Text>
              <TouchableOpacity onPress={closeForm}>
                <Ionicons name="close" size={24} color="#1c2f87" />
              </TouchableOpacity>
            </View>

            <View>
              <Text style={styles.section}>Advance Details</Text>
              <DropdownField
                key="hotel_id"
                label="Select Hotel"
                placeholder="Choose a hotel"
                value={form.hotel_id}
                options={hotelOptions}
                onSelect={handleHotelSelect}
                error={errors.hotel_id}
              />
              {renderEmployeeDropdown()}
              <DropdownField
                key="type"
                label="Transaction Type"
                placeholder="Select type"
                value={form.type}
                options={typeOptions}
                onSelect={handleTypeSelect}
                error={errors.type}
              />
              {renderInput('amount', 'Amount', { keyboardType: 'numeric' })}
              {renderInput('reason', 'Reason', {
                autoCapitalize: 'sentences',
                multiline: true,
                numberOfLines: 3,
              })}
              {renderDateInput()}

              {/* Form Action Buttons */}
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
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  entryCard: {
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
  entryInfo: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 16,
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
  },
  entryHotel: {
    fontSize: 13,
    color: '#fe8c06',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  entryAmount: {
    fontSize: 15,
    // color: '#28a745',
    fontFamily: 'Poppins-Bold',
    marginTop: 4,
  },
  entryReason: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  entryDate: {
    fontSize: 11,
    color: '#888',
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
  section: {
    marginTop: 20,
    marginBottom: 10,
    fontWeight: '600',
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#1c2f87',
  },
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginTop: -4,
    marginBottom: 4,
    marginLeft: 4,
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
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginVertical: 6,
  },
  dateInput: {
    flex: 1,
    padding: 12,
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#1c2f87',
  },
  calendarIcon: {
    padding: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#e9ecef',
  },
  dropdownLoading: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginVertical: 6,
  },
  dropdownLoadingText: {
    marginLeft: 8,
    color: '#6c757d',
  },
  dropdownDisabled: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  dropdownDisabledText: {
    color: '#6c757d',
    fontStyle: 'italic',
  },
  debitAmount: {
    fontSize: 15,
    color: '#dc3545', // Red for debit
    fontFamily: 'Poppins-Bold',
    marginTop: 4,
  },
  creditAmount: {
    fontSize: 15,
    color: '#28a745', // Green for credit
    fontFamily: 'Poppins-Bold',
    marginTop: 4,
  },
});
