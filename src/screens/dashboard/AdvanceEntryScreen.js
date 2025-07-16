import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  ScrollView,
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
  reason: { required: true, minLength: 0, maxLength: 200 },
  date: { required: true, minLength: 8, maxLength: 12 },
  type: { required: true },
};

const typeOptions = [
  { value: 'debit', label: 'Debit' },
  { value: 'credit', label: 'Credit' },
];

const TableView = ({ data, onEdit, onDelete }) => {
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
            <Text style={[styles.tableHeaderCell, { width: 150 }]}>
              Employee
            </Text>
            <Text style={[styles.tableHeaderCell, { width: 120 }]}>Hotel</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>Amount</Text>
            <Text style={[styles.tableHeaderCell, { width: 200 }]}>Reason</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>Date</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>
              Actions
            </Text>
          </View>

          {/* Table Content */}
          <View>
            {data.map(item => (
              <View key={item.id.toString()} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: 150 }]}>
                  {item.employee.name}
                </Text>
                <Text style={[styles.tableCell, { width: 120 }]}>
                  {item.hotel.name}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { width: 100 },
                    item.type === 'Debit'
                      ? styles.debitAmount
                      : styles.creditAmount,
                  ]}
                >
                  {item.type === 'Debit'
                    ? `-₹${item.amount}`
                    : `+₹${item.amount}`}
                </Text>
                <Text style={[styles.tableCell, { width: 200 }]}>
                  {item.reason}
                </Text>
                <Text style={[styles.tableCell, { width: 100 }]}>
                  {item.date}
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

  useEffect(() => {
    console.log("Advances data: ----------------", advances);  // Logs the advances whenever the state changes
  }, [advances]);

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

  // Filter state
  const [filters, setFilters] = useState({
    hotel_id: '',
    employee_id: '',
    type: '',
    from_date: '',
    to_date: '',
  });

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'table'
  const [datePickerMode, setDatePickerMode] = useState('form'); // 'form' or 'filter'
  const [datePickerField, setDatePickerField] = useState(''); // 'from' or 'to'

  // Fetch hotels and advances on component mount
  useEffect(() => {
    dispatch(fetchHotels());
    dispatch(fetchAllAdvances(filters)); // Pass initial filters (empty object)
  }, [dispatch]);

  // Prepare hotel options for dropdown
  const hotelOptions = hotels.map(hotel => ({
    value: hotel?.id,
    label: hotel?.name,
  }));

  // Prepare employee options for dropdown
  const employeeOptions = employees.map(employee => ({
    value: employee.id.toString(),
    label: employee.name,
  }));

  // Filter the advances data
  // Remove this useMemo from your component
  const filteredAdvances = useMemo(() => {
    return advances.filter(advance => {
      // Filter by hotel
      if (filters.hotel_id && advance.hotel_id !== parseInt(filters.hotel_id)) return false;

      // Filter by employee - convert both to string for comparison
      if (filters.employee_id && advance.employee_id.toString() !== filters.employee_id) return false;

      // Filter by type (case insensitive)
      if (filters.type && advance.type.toLowerCase() !== filters.type.toLowerCase()) return false;

      // Filter by date range
      if (filters.from_date && advance.date < filters.from_date) return false;
      if (filters.to_date && advance.date > filters.to_date) return false;

      return true;
    });
  }, [advances, filters]);

  console.log("filteredAdvances", filteredAdvances);


  const { totalDebit, totalCredit, netAmount } = useMemo(() => {
    let debit = 0;
    let credit = 0;

    advances.forEach(advance => {  // Changed from filteredAdvances to advances
      const amount = parseFloat(advance.amount);
      if (advance.type.toLowerCase() === 'debit') {
        debit += amount;
      } else {
        credit += amount;
      }
    });

    return {
      totalDebit: debit,
      totalCredit: credit,
      netAmount: credit - debit
    };
  }, [advances]);

  // Handle hotel selection
  const handleHotelSelect = selectedItem => {
    setForm(prev => ({
      ...prev,
      hotel_id: selectedItem.value,
      employee_id: '',
    }));

    if (errors.hotel_id) {
      setErrors(prev => ({ ...prev, hotel_id: '' }));
    }

    dispatch(fetchHotelEmployees(selectedItem.value));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    Promise.all([
      dispatch(fetchHotels()),
      dispatch(fetchAllAdvances(filters)), // Pass current filters
    ]).finally(() => {
      setRefreshing(false);
    });
  };

  const handleTypeSelect = selectedItem => {
    setForm(prev => ({ ...prev, type: selectedItem.value }));

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
      const stringValue =
        value !== undefined && value !== null ? String(value) : '';

      if (rules.required && (!stringValue || stringValue.trim() === '')) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)
          } is required`;
        return;
      }

      if (stringValue && stringValue.trim() !== '') {
        if (rules.minLength && stringValue.length < rules.minLength) {
          newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)
            } must be at least ${rules.minLength} characters`;
        } else if (rules.maxLength && stringValue.length > rules.maxLength) {
          newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)
            } must be less than ${rules.maxLength} characters`;
        }

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
    if (field === 'amount') {
      // Remove all non-numeric characters except decimal point
      let numericValue = value.replace(/[^0-9.]/g, '');

      // Remove extra decimal points
      const parts = numericValue.split('.');
      if (parts.length > 2) {
        numericValue = parts[0] + '.' + parts.slice(1).join('');
      }

      // Limit to 2 decimal places
      if (parts.length === 2) {
        numericValue = parts[0] + '.' + parts[1].slice(0, 2);
      }

      value = numericValue;
    }

    setForm(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle employee dropdown selection
  const handleEmployeeSelect = selectedItem => {
    setForm(prev => ({ ...prev, employee_id: selectedItem.value }));

    if (errors.employee_id) {
      setErrors(prev => ({ ...prev, employee_id: '' }));
    }
  };

  // Handle date picker
  const handleDateChange = (event, date) => {
    setShowDatePicker(false);

    if (date) {
      const formattedDate = date.toISOString().split('T')[0];

      if (datePickerMode === 'form') {
        setSelectedDate(date);
        setForm(prev => ({ ...prev, date: formattedDate }));
        if (errors.date) setErrors(prev => ({ ...prev, date: '' }));
      } else {
        // For filter dates
        setFilters(prev => ({
          ...prev,
          [`${datePickerField}_date`]: formattedDate,
        }));
      }
    }
  };

  // Open date picker for form
  const openDatePicker = () => {
    setDatePickerMode('form');
    setShowDatePicker(true);
  };

  // Open date picker for filters
  const openFilterDatePicker = (field) => {
    setDatePickerMode('filter');
    setDatePickerField(field);
    setShowDatePicker(true);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    const advanceData = {
      employee_id: parseInt(form.employee_id), // Convert to number
      hotel_id: parseInt(form.hotel_id),      // Convert to number
      amount: parseInt(form.amount),         // Convert to number
      reason: form.reason.trim(),
      date: form.date,
      type: form.type.charAt(0).toUpperCase() + form.type.slice(1), // Capitalize first letter
      added_by: user.id,
    };

    if (editId) {
      dispatch(updateAdvance({ ...advanceData, id: editId }))
        .unwrap()
        .then(() => {
          dispatch(fetchAllAdvances()),
            closeForm();
        })
        .catch(error => {
          Alert.alert('Error', error || 'Failed to update advance');
        });
    } else {
      dispatch(addAdvance(advanceData))
        .unwrap()
        .then(() => {
          dispatch(fetchAllAdvances()),
            closeForm();
        })
        .catch(error => {
          Alert.alert('Error', error || 'Failed to add advance');
        });
    }
  };

  // Handle edit advance entry
  const handleEdit = entry => {
    // Format amount to remove any trailing .0 or .00
    const formattedAmount = entry.amount % 1 === 0
      ? entry.amount.toString().split('.')[0]
      : entry.amount.toString();

    setForm({
      hotel_id: entry.hotel_id,
      employee_id: entry.employee_id.toString(),
      amount: formattedAmount,
      reason: entry.reason,
      date: entry.date,
      type: entry.type.toLowerCase() || 'debit',
    });
    setEditId(entry.id);
    setShowForm(true);
    setErrors({});

    if (entry.date) {
      const dateParts = entry.date.split('-');
      if (dateParts.length === 3) {
        setSelectedDate(new Date(dateParts[0], dateParts[1] - 1, dateParts[2]));
      }
    }

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

    const selectedEmployee = employeeOptions.find(
      emp => emp.value === form.employee_id
    );

    return (
      <DropdownField
        key="employee_id"
        label="Select Employee"
        placeholder={selectedEmployee ? selectedEmployee.label : "Choose an employee"}
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

  // Filter Component
  const FilterComponent = () => (
    <View style={styles.filterContainer}>
      <View style={styles.filterHeader}>
        <Text style={styles.filterTitle}>Filter Advances</Text>
        <TouchableOpacity onPress={() => setShowFilters(false)}>
          <Ionicons name="close" size={24} color="#1c2f87" />
        </TouchableOpacity>
      </View>

      <DropdownField
        label="Filter by Hotel"
        placeholder="All Hotels"
        value={filters.hotel_id}
        options={[{ value: '', label: 'All Hotels' }, ...hotelOptions]}
        onSelect={selectedItem => {
          setFilters(prev => ({
            ...prev,
            hotel_id: selectedItem.value,
            employee_id: '', // Reset employee when hotel changes
          }));
          if (selectedItem.value) {
            dispatch(fetchHotelEmployees(selectedItem.value));
          }
        }}
      />

      <DropdownField
        label="Filter by Employee"
        placeholder="All Employees"
        value={filters.employee_id}
        options={[
          { value: '', label: 'All Employees' },
          ...(filters.hotel_id
            ? employeeOptions
            : []), // Only show employees if a hotel is selected
        ]}
        onSelect={selectedItem => {
          setFilters(prev => ({ ...prev, employee_id: selectedItem.value }));
        }}
        disabled={!filters.hotel_id}
      />

      <DropdownField
        label="Filter by Type"
        placeholder="All Types"
        value={filters.type}
        options={[{ value: '', label: 'All Types' }, ...typeOptions]}
        onSelect={selectedItem => {
          setFilters(prev => ({ ...prev, type: selectedItem.value }));
        }}
      />

      <View style={styles.dateFilterRow}>
        <TouchableOpacity
          style={styles.dateFilterInput}
          onPress={() => openFilterDatePicker('from')}
        >
          <Text style={filters.from_date ? styles.dateFilterText : styles.dateFilterPlaceholder}>
            {filters.from_date || 'From Date'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateFilterInput}
          onPress={() => openFilterDatePicker('to')}
        >
          <Text style={filters.to_date ? styles.dateFilterText : styles.dateFilterPlaceholder}>
            {filters.to_date || 'To Date'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterButtonRow}>
        <TouchableOpacity
          style={styles.clearFilterButton}
          onPress={() => {
            setFilters({
              hotel_id: '',
              employee_id: '',
              type: '',
              from_date: '',
              to_date: '',
            });
            setShowFilters(false);
          }}
        >
          <Text style={styles.clearFilterButtonText}>Clear Filters</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.applyFilterButton}
          onPress={() => {
            dispatch(fetchAllAdvances(filters)); // Pass updated filters
            setShowFilters(false);
          }}        >
          <Text style={styles.applyFilterButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={22} color="#1c2f87" />
            {Object.values(filters).some(val => val !== '') && (
              <View style={styles.filterBadge} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewToggleBtn}
            onPress={() => setViewMode(prev => (prev === 'list' ? 'table' : 'list'))}
          >
            <Ionicons
              name={viewMode === 'list' ? 'grid-outline' : 'list-outline'}
              size={24}
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

      {/* Advance Entries View */}
      {viewMode === 'list' ? (
        <>
          <FlatList
            data={advances}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#1c2f87']}
                tintColor="#1c2f87"
              />
            }
            renderItem={({ item }) => (
              <View style={styles.entryCard}>
                <View style={styles.entryInfo}>
                  <Text style={styles.entryTitle}>{item?.employee?.name}</Text>
                  <Text style={styles.entryHotel}>{item?.hotel?.name || 'Hotel name not available'}</Text>
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
              <Text style={styles.emptyText}>No advance entries found.</Text>
            }
          />
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Debit:</Text>
              <Text style={[styles.totalValue, styles.debitAmount]}>₹{totalDebit.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Credit:</Text>
              <Text style={[styles.totalValue, styles.creditAmount]}>₹{totalCredit.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Net Amount:</Text>
              <Text style={[
                styles.totalValue,
                netAmount >= 0 ? styles.creditAmount : styles.debitAmount
              ]}>
                ₹{Math.abs(netAmount).toFixed(2)} {netAmount >= 0 ? '(Credit)' : '(Debit)'}
              </Text>
            </View>
          </View>
        </>
      ) : (
        <>

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
              data={advances}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            {advances.length === 0 && (
              <Text style={styles.emptyText}>No advance entries found.</Text>
            )}
          </ScrollView>
          <View style={styles.totalsContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Debit:</Text>
              <Text style={[styles.totalValue, styles.debitAmount]}>₹{totalDebit.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Credit:</Text>
              <Text style={[styles.totalValue, styles.creditAmount]}>₹{totalCredit.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Net Amount:</Text>
              <Text style={[
                styles.totalValue,
                netAmount >= 0 ? styles.creditAmount : styles.debitAmount
              ]}>
                ₹{Math.abs(netAmount).toFixed(2)} {netAmount >= 0 ? '(Credit)' : '(Debit)'}
              </Text>
            </View>
          </View>
        </>
      )}

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

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <FilterComponent />
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewToggleBtn: {
    marginRight: 12,
    padding: 4,
  },
  filterBtn: {
    marginRight: 12,
    padding: 4,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fe8c06',
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
    color: '#dc3545',
  },
  creditAmount: {
    color: '#28a745',
  },
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
  filterContainer: {
    backgroundColor: '#fff',
    borderRadius: 18,
    width: '92%',
    maxHeight: '90%',
    padding: 18,
    elevation: 8,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 18,
    color: '#1c2f87',
    fontFamily: 'Poppins-Bold',
  },
  dateFilterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  dateFilterInput: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
  },
  dateFilterText: {
    color: '#1c2f87',
    fontFamily: 'Poppins-Regular',
  },
  dateFilterPlaceholder: {
    color: '#a0a3bd',
    fontFamily: 'Poppins-Regular',
  },
  filterButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
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
  applyFilterButton: {
    backgroundColor: '#1c2f87',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
  },
  applyFilterButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  totalsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1c2f87',
  },
  totalValue: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  debitAmount: {
    color: '#dc3545',
  },
  creditAmount: {
    color: '#28a745',
  },
});