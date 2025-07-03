import React, { useState } from 'react';
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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DropdownField from '../../components/DropdownField';
import DateTimePicker from '@react-native-community/datetimepicker';

// Form validation rules
const VALIDATION_RULES = {
  hotel_id: { required: true, minLength: 1, maxLength: 50 },
  employee_id: { required: true, minLength: 1, maxLength: 50 },
  amount: { required: true, pattern: /^\d+$/ },
  reason: { required: true, minLength: 5, maxLength: 200 },
  date: { required: true, minLength: 8, maxLength: 12 },
};

// Temporary data
const mockAdvanceEntries = [
  { id: 1, hotel_id: 'Lake Side Inn', employee_id: 'John Doe', amount: '5000', reason: 'Medical emergency', date: '2024-01-15' },
  { id: 2, hotel_id: 'Walstar Classic', employee_id: 'Priya Sharma', amount: '3000', reason: 'Home repair', date: '2024-01-20' },
  { id: 3, hotel_id: 'Kalamba Residency', employee_id: 'Amit Kumar', amount: '7500', reason: 'Education fees', date: '2024-01-25' },
  { id: 4, hotel_id: 'Lake Side Inn', employee_id: 'Sarah Wilson', amount: '4000', reason: 'Vehicle maintenance', date: '2024-01-30' },
];

// Hotel options
const hotelOptions = [
  { value: 'Lake Side Inn', label: 'Lake Side Inn' },
  { value: 'Walstar Classic', label: 'Walstar Classic' },
  { value: 'Kalamba Residency', label: 'Kalamba Residency' },
  { value: 'Royal Palace', label: 'Royal Palace' },
  { value: 'Grand Hotel', label: 'Grand Hotel' },
];

// Employee options
const employeeOptions = [
  { value: 'John Doe', label: 'John Doe' },
  { value: 'Priya Sharma', label: 'Priya Sharma' },
  { value: 'Amit Kumar', label: 'Amit Kumar' },
  { value: 'Sarah Wilson', label: 'Sarah Wilson' },
  { value: 'Michael Brown', label: 'Michael Brown' },
  { value: 'Lisa Johnson', label: 'Lisa Johnson' },
  { value: 'David Lee', label: 'David Lee' },
  { value: 'Emma Davis', label: 'Emma Davis' },
];

export default function AdvanceEntryScreen() {
  const { t } = useTranslation();
  
  // Form state
  const [form, setForm] = useState({
    hotel_id: '',
    employee_id: '',
    amount: '',
    reason: '',
    date: '',
  });
  
  // UI state
  const [advanceEntries, setAdvanceEntries] = useState(mockAdvanceEntries);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Form validation function
  const validateForm = () => {
    const newErrors = {};

    Object.keys(VALIDATION_RULES).forEach(field => {
      const value = form[field];
      const rules = VALIDATION_RULES[field];

      // Required field validation
      if (rules.required && (!value || value.trim() === '')) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        return;
      }

      if (value && value.trim() !== '') {
        // Length validation
        if (rules.minLength && value.length < rules.minLength) {
          newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rules.minLength} characters`;
        } else if (rules.maxLength && value.length > rules.maxLength) {
          newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be less than ${rules.maxLength} characters`;
        }

        // Pattern validation
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
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle dropdown selection
  const handleDropdownSelect = (field, selectedItem) => {
    setForm(prev => ({ ...prev, [field]: selectedItem.value }));
    
    // Clear error when user selects an option
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    const advanceData = {
      ...form,
      hotel_id: form.hotel_id.trim(),
      employee_id: form.employee_id.trim(),
      reason: form.reason.trim(),
      date: form.date.trim(),
    };

    if (editId) {
      setAdvanceEntries(prev =>
        prev.map(entry =>
          entry.id === editId ? { ...entry, ...advanceData, id: editId } : entry
        )
      );
    } else {
      setAdvanceEntries(prev => [
        ...prev,
        {
          id: prev.length ? Math.max(...prev.map(e => e.id)) + 1 : 1,
          ...advanceData,
        },
      ]);
    }

    closeForm();
  };

  // Handle edit advance entry
  const handleEdit = entry => {
    setForm({ ...entry });
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
          onPress: () => setAdvanceEntries(prev => prev.filter(e => e.id !== id)),
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
        onChangeText={text => handleChange(field, text)}
        value={form[field]}
        {...options}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  // Render dropdown field
  const renderDropdown = (field, label, placeholder, options) => (
    <DropdownField
      key={field}
      label={label}
      placeholder={placeholder}
      value={form[field]}
      options={options}
      onSelect={(selectedItem) => handleDropdownSelect(field, selectedItem)}
      error={errors[field]}
    />
  );

  // Render date input with calendar icon
  const renderDateInput = () => (
    <View>
      <View style={[styles.dateInputContainer, errors.date && styles.inputError]}>
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
        data={advanceEntries}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.entryCard}>
            <View style={styles.entryInfo}>
              <Text style={styles.entryTitle}>{item.employee_id}</Text>
              <Text style={styles.entryHotel}>{item.hotel_id}</Text>
              <Text style={styles.entryAmount}>₹{item.amount}</Text>
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
              {renderDropdown('hotel_id', 'Select Hotel', 'Choose a hotel', hotelOptions)}
              {renderDropdown('employee_id', 'Select Employee', 'Choose an employee', employeeOptions)}
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
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
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
    color: '#28a745',
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
});
