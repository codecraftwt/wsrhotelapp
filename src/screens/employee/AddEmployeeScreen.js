import React, { useState, useEffect, useRef } from 'react';
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
  Image,
  Platform,
  PermissionsAndroid,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEmployees,
  addEmployee,
  deleteEmployee,
  updateEmployee,
  resetEmployees,
  clearValidationErrors,
} from '../../redux/slices/employeeSlice';
import { fetchHotels } from '../../redux/slices/hotelSlice';
import DropdownField from '../../components/DropdownField';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import DeleteAlert from '../../components/DeleteAlert';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CalendarModal from '../../components/CalendarModal';
import { createUser } from '../../redux/slices/userSlice';

// Form validation rules
const VALIDATION_RULES = {
  name: { required: true, minLength: 2, maxLength: 50 },
  email: {
    required: true,
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
  mobile: { required: true, pattern: /^[6-9]\d{9}$/ },
  role: { required: true, minLength: 2, maxLength: 30 },
  salary: { required: true, pattern: /^\d+(\.\d{1,2})?$/ },
  join_date: { required: true },
  address_line: { required: true, minLength: 2, maxLength: 200 },
};

const TableView = ({
  data,
  onEdit,
  onDelete,
  loading,
  hasMore,
  onLoadMore,
  onRefresh,
  isRefreshing,
  selectionMode,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}) => {
  const scrollViewRef = useRef(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // const handleLoadMore = async () => {
  //   if (!hasMore || isLoadingMore) return;
  //   setIsLoadingMore(true);
  //   await onLoadMore();
  //   setIsLoadingMore(false);
  // };

  const renderFooter = () => {
    if (!loading || !hasMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#1c2f87" />
      </View>
    );
  };

  return (
    <View style={styles.tableContainer}>
      <ScrollView horizontal>
        <View>
          {/* Sticky Header */}
          <View style={styles.tableHeader}>
            {/* Select All Checkbox */}
            <TouchableOpacity
              onPress={onToggleSelectAll}
              style={[
                styles.tableHeaderCell,
                { width: 50, alignItems: 'center' },
              ]}
            >
              {selectionMode ? (
                <Ionicons
                  name={
                    data?.length > 0 &&
                    data.every(item => selectedIds.has(item?.employee?.id))
                      ? 'checkbox-outline'
                      : 'square-outline'
                  }
                  size={20}
                  color="#fff"
                />
              ) : (
                <Text style={{ color: 'transparent' }}>#</Text>
              )}
            </TouchableOpacity>
            <Text style={[styles.tableHeaderCell, { width: 150 }]}>
              Employee Name
            </Text>
            <Text style={[styles.tableHeaderCell, { width: 120 }]}>Role</Text>
            <Text style={[styles.tableHeaderCell, { width: 120 }]}>Mobile</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>Salary</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>
              Join Date
            </Text>
            <Text style={[styles.tableHeaderCell, { width: 150 }]}>Hotel</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>
              Actions
            </Text>
          </View>

          {/* Scrollable Rows */}
          <FlatList
            data={data}
            keyExtractor={item => item?.employee?.id?.toString()}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                {/* Row Checkbox */}
                <TouchableOpacity
                  onPress={() =>
                    selectionMode && onToggleSelect(item?.employee?.id)
                  }
                  style={{ width: 50, alignItems: 'center' }}
                  disabled={!selectionMode}
                >
                  {selectionMode ? (
                    <Ionicons
                      name={
                        selectedIds.has(item?.employee?.id)
                          ? 'checkbox-outline'
                          : 'square-outline'
                      }
                      size={20}
                      color="#1c2f87"
                    />
                  ) : (
                    <Text style={{ color: 'transparent' }}>#</Text>
                  )}
                </TouchableOpacity>
                <Text style={[styles.tableCell, { width: 150 }]}>
                  {item.employee?.name}
                </Text>
                <Text style={[styles.tableCell, { width: 120 }]}>
                  {item.employee?.role}
                </Text>
                <Text style={[styles.tableCell, { width: 120 }]}>
                  {item.employee?.mobile}
                </Text>
                <Text style={[styles.tableCell, { width: 100 }]}>
                  ₹{item.employee?.salary}
                </Text>
                <Text style={[styles.tableCell, { width: 100 }]}>
                  {item.employee?.join_date}
                </Text>
                <Text style={[styles.tableCell, { width: 150 }]}>
                  {item?.employee?.hotel?.name || 'N/A'}
                </Text>
                <View style={[styles.tableActions, { width: 100 }]}>
                  <TouchableOpacity onPress={() => onEdit(item)}>
                    <Ionicons name="create-outline" size={20} color="#1c2f87" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onDelete(item?.employee?.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#fe8c06" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={['#1c2f87']}
              />
            }
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.2}
            contentContainerStyle={styles.tableContentContainer}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default function AddEmployeeScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);

  const {
    employees,
    loading,
    page,
    perPage,
    hasMore,
    error,
    validationErrors,
  } = useSelector(state => state.employee);
  console.log('Employees:', employees);
  const { hotels } = useSelector(state => state.hotel);

  const hotelOptions = hotels.map(hotel => ({
    value: hotel?.id,
    label: hotel?.name,
  }));

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    alt_mobile: '',
    hotel: '',
    role: '',
    salary: '',
    join_date: '',
    address_line: '',
    landmark: '',
    city: '',
    taluka: '',
    district: '',
    state: '',
    pincode: '',
    password: '',
    is_user: 0,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle backend validation errors
  useEffect(() => {
    if (validationErrors) {
      const newErrors = {};

      // Map backend validation errors to form fields
      if (validationErrors.email) {
        newErrors.email = Array.isArray(validationErrors.email)
          ? validationErrors.email[0]
          : validationErrors.email;
      }
      if (validationErrors.mobile) {
        newErrors.mobile = Array.isArray(validationErrors.mobile)
          ? validationErrors.mobile[0]
          : validationErrors.mobile;
      }
      if (validationErrors.password) {
        newErrors.password = Array.isArray(validationErrors.password)
          ? validationErrors.password[0]
          : validationErrors.password;
      }

      setErrors(prev => ({ ...prev, ...newErrors }));

      // Scroll to first backend validation error
      if (Object.keys(newErrors).length > 0) {
        scrollToFirstError(newErrors);
      }

      // Clear validation errors after displaying them
      dispatch(clearValidationErrors());
    }
  }, [validationErrors, dispatch]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      dispatch(resetEmployees());
      dispatch(fetchEmployees({ page: 1, per_page: perPage }));
    } else {
      const debounceTimer = setTimeout(() => {
        dispatch(resetEmployees());
        dispatch(
          fetchEmployees({
            page: 1,
            per_page: perPage,
            search: searchQuery,
          }),
        );
      }, 500);

      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery]);

  const loadInitialData = async () => {
    try {
      await dispatch(fetchEmployees({ page: 1, per_page: perPage }));
      await dispatch(fetchHotels());
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchEmployees({ page: 1, per_page: perPage }));
    } finally {
      setIsRefreshing(false);
    }
  };

  // In your component
  const handleLoadMore = async () => {
    console.log('handleLoadMore called - hasMore:', hasMore, 'loading:', loading, 'current page:', page);
    if (!hasMore || loading) return;

    try {
      console.log('Loading more employees - page:', page + 1);
      await dispatch(
        fetchEmployees({
          page: page + 1,
          per_page: perPage,
          search: searchQuery,
        }),
      );
    } catch (error) {
      console.error('Error loading more:', error);
    }
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      setSelectedDate(date);
      handleChange('join_date', formattedDate);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    Object.keys(VALIDATION_RULES).forEach(field => {
      // const value = form[field];
      let value = form[field]?.toString().trim();
      const rules = VALIDATION_RULES[field];
      if (rules.required && (!value || value.trim() === '')) {
        // Custom error messages for specific fields
        if (field === 'address_line') {
          newErrors[field] = 'Address is required';
        } else if (field === 'join_date') {
          newErrors[field] = 'Date is required'; // Custom error for join_date
        } else {
          newErrors[field] = `${
            field.charAt(0).toUpperCase() + field.slice(1)
          } is required`;
        }
        return;
      }

      // if (rules.required && (!value || value.trim() === '')) {
      //   newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      //   return;
      // }

      if (value && value.trim() !== '') {
        if (rules.minLength && value.length < rules.minLength) {
          newErrors[field] = `${
            field.charAt(0).toUpperCase() + field.slice(1)
          } must be at least ${rules.minLength} characters`;
        } else if (rules.maxLength && value.length > rules.maxLength) {
          newErrors[field] = `${
            field.charAt(0).toUpperCase() + field.slice(1)
          } must be less than ${rules.maxLength} characters`;
        }

        if (rules.pattern && !rules.pattern.test(value)) {
          if (field === 'mobile') {
            if (!/^\d+$/.test(value)) {
              newErrors[field] = 'Mobile number must contain digits only';
            } else if (value.length !== 10) {
              newErrors[field] = 'Mobile number must be exactly 10 digits';
            }
          } else if (field === 'pincode') {
            newErrors[field] = 'Please enter a valid 6-digit pincode';
          } else if (field === 'salary') {
            newErrors[field] = 'Please enter a valid salary amount';
          }
        }
      }
    });
    if (!form.hotel) {
      newErrors.hotel = 'Please select a hotel';
    }

    setErrors(newErrors);
    
    // If there are validation errors, scroll to the first error field
    if (Object.keys(newErrors).length > 0) {
      scrollToFirstError(newErrors);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const scrollToFirstError = (errorFields) => {
    // Define the order of fields as they appear in the form
    const fieldOrder = [
      'name',
      'email', 
      'mobile',
      'alt_mobile',
      'role',
      'hotel',
      'salary',
      'join_date',
      'address_line',
      'landmark',
      'city',
      'taluka',
      'district',
      'state',
      'pincode',
      'password'
    ];

    // Find the first field with an error based on form order
    const firstErrorField = fieldOrder.find(field => errorFields[field]);
    
    if (firstErrorField && scrollViewRef.current) {
      // Calculate approximate scroll position based on field order
      const fieldIndex = fieldOrder.indexOf(firstErrorField);
      
      // Estimate scroll position (adjust these values based on your form layout)
      let scrollY = 0;
      
      if (fieldIndex <= 4) {
        // Personal Details section fields (name, email, mobile, alt_mobile, role)
        scrollY = 0;
      } else if (fieldIndex <= 7) {
        // Job Details section fields (hotel, salary, join_date)
        scrollY = 200;
      } else {
        // Address section fields
        scrollY = 400;
      }

      // Scroll to the estimated position
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: scrollY,
          animated: true,
        });
      }, 100);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDropdownSelect = (field, selectedItem) => {
    setForm(prev => ({ ...prev, [field]: selectedItem.value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    // Clear previous validation errors
    setErrors({});
    dispatch(clearValidationErrors());

    if (!validateForm()) {
      return;
    }

    try {
      if (editId) {
        const employeeData = {
          name: form.name,
          email: form.email,
          mobile: form.mobile,
          alt_mobile: form.alt_mobile,
          hotel_id: form.hotel,
          role: form.role,
          salary: Math.round(Number(form.salary)),
          join_date: form.join_date,
          address_line: form.address_line,
          landmark: form.landmark,
          city: form.city,
          taluka: form.taluka,
          district: form.district,
          state: form.state,
          pincode: form.pincode,
          id: editId,
          password: '', // password should not autofill for security
          is_user: form.is_user === 1 ? 1 : 0,
        };
        const result = await dispatch(updateEmployee(employeeData));
        if (updateEmployee.fulfilled.match(result)) {
          closeForm();
          Toast.show({
            type: 'success',
            text1: 'Employee updated successfully',
          });

          // Refresh the employee list
          dispatch(resetEmployees());
          await dispatch(
            fetchEmployees({
              page: 1,
              per_page: perPage,
              search: searchQuery,
            }),
          );
        } else if (updateEmployee.rejected.match(result)) {
          console.log('Employee update failed:', result.payload);
        }
      } else {
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('email', form.email);
        formData.append('mobile', form.mobile);
        formData.append('alt_mobile', form.alt_mobile);
        formData.append('hotel_id', form.hotel);
        formData.append('role', form.role);
        formData.append('salary', Number(form.salary));
        formData.append('join_date', form.join_date);
        formData.append('address_line', form.address_line);
        formData.append('landmark', form.landmark);
        formData.append('city', form.city);
        formData.append('taluka', form.taluka);
        formData.append('district', form.district);
        formData.append('state', form.state);
        formData.append('pincode', form.pincode);
        formData.append('is_user', form.is_user);

        if (form.is_user === 1) {
          formData.append('email', form.email);

          if (form.password && form.password.trim() !== '') {
            formData.append('password', form.password);
          }
        }

        console.log('formData ---------', formData);

        const result = await dispatch(addEmployee(formData));

        if (addEmployee.fulfilled.match(result)) {
          if (form.is_user === 1) {
            const userPayload = {
              name: form.name,
              email: form.email,
              password: form.password,
              hotel_id: form.hotel,
              role: form.role,
            };
            console.log('userPayload----', userPayload);

            await dispatch(createUser(userPayload));
          }

          // Close form and show success message
          closeForm();
          Toast.show({
            type: 'success',
            text1: 'Employee added successfully',
          });

          // Refresh the employee list
          dispatch(resetEmployees());
          await dispatch(
            fetchEmployees({
              page: 1,
              per_page: perPage,
              search: searchQuery,
            }),
          );
        } else if (addEmployee.rejected.match(result)) {
          // Handle validation errors - they will be shown via the useEffect
          console.log('Employee addition failed:', result.payload);
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleEdit = emp => {
    const isRoleEligible =
      emp.employee.role === 'Manager' || emp.employee.role === 'Receptionist';
    const normalizedJoinDate = emp.employee.join_date
      ? new Date(emp.employee.join_date).toISOString().split('T')[0]
      : '';
    setForm({
      name: emp.employee.name || '',
      email: emp.employee.email || '',
      mobile: emp.employee.mobile || '',
      alt_mobile: emp.employee.alt_mobile || '',
      hotel: emp.employee.hotel_id || emp.employee.hotel?.id || '',
      role: emp.employee.role || '',
      salary: emp.employee.salary ? String(emp.employee.salary) : '',
      join_date: normalizedJoinDate,
      address_line: emp.employee.address_line || '',
      landmark: emp.employee.landmark || '',
      city: emp.employee.city || '',
      taluka: emp.employee.taluka || '',
      district: emp.employee.district || '',
      state: emp.employee.state || '',
      pincode: emp.employee.pincode || '',
      password: emp.employee.password || '', // password should not autofill for security
      is_user: isRoleEligible ? 1 : 0,
      // is_user: emp.employee.is_user|| '',
    });
    setEditId(emp.employee?.id);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = id => {
    if (selectionMode) {
      toggleSelect(id);
      return;
    }
    setSelectedEmployeeId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!selectedEmployeeId) return;

    dispatch(deleteEmployee([selectedEmployeeId])) // note the array
      // .unwrap()
      .then(() => {
        Toast.show({
          type: 'success',
          text1: 'Deleted successfully',
        });
        dispatch(resetEmployees());
        dispatch(fetchEmployees({ page: 1, per_page: perPage }));
      })
      .catch(error => {
        Toast.show({
          type: 'error',
          text1: 'Delete failed',
          text2: error,
        });
      });

    setShowDeleteModal(false);
    setSelectedEmployeeId(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedEmployeeId(null);
  };

  const confirmBulkDelete = () => {
    if (selectedIds.size === 0) return;

    const idsArray = Array.from(selectedIds);
    dispatch(deleteEmployee(idsArray))
      .then(() => {
        Toast.show({ type: 'success', text1: 'Deleted successfully' });
        dispatch(resetEmployees());
        dispatch(fetchEmployees({ page: 1, per_page: perPage }));
        exitSelectionMode();
      })
      .catch(error => {
        Toast.show({ type: 'error', text1: 'Delete failed', text2: error });
      });

    setShowBulkDeleteModal(false);
  };

  const cancelBulkDelete = () => {
    setShowBulkDeleteModal(false);
  };

  const enterSelectionMode = (initialId = null) => {
    setSelectionMode(true);
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (initialId != null) {
        next.add(initialId);
      }
      return next;
    });
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const toggleSelect = id => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const allIds = employees
      .filter(e => e && e?.employee?.id)
      .map(e => e?.employee?.id);
    const areAllSelected =
      allIds.length > 0 && allIds.every(id => selectedIds.has(id));
    if (areAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setErrors({});
    setProfileImage(null);
    dispatch(clearValidationErrors());
    setForm({
      name: '',
      email: '',
      mobile: '',
      alt_mobile: '',
      hotel: '',
      role: '',
      salary: '',
      join_date: '',
      address_line: '',
      landmark: '',
      city: '',
      taluka: '',
      district: '',
      state: '',
      pincode: '',
      password: '',
      is_user: 0,
    });
  };

  // const renderInput = (field, placeholder, options = {}) => (
  //   <View key={field}>
  //     <TextInput
  //       placeholder={placeholder}
  //       style={[styles.input, errors[field] && styles.inputError]}
  //       onChangeText={text => handleChange(field, text)}
  //       value={form[field]}
  //       {...options}
  //     />
  //     {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
  //   </View>
  // );

  const renderInput = (field, label, options = {}) => (
    <View key={field} style={{ marginBottom: 8 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={options.placeholder || ''}
        style={[styles.input, errors[field] && styles.inputError]}
        onChangeText={text => handleChange(field, text)}
        value={form[field]}
        {...options}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  const renderDropdown = (field, label, placeholder, options) => (
    <DropdownField
      key={field}
      label={label}
      placeholder={placeholder}
      value={form[field]}
      options={options}
      onSelect={selectedItem => handleDropdownSelect(field, selectedItem)}
      error={errors[field]}
    />
  );

  const renderDateInput = () => (
    <View>
      {/* <Text style={styles.label}>Join Date</Text> */}

      <TouchableOpacity
        style={[
          styles.dateInputContainer,
          errors.join_date && styles.inputError,
        ]}
        onPress={() => {
          if (!form.join_date) {
            const today = new Date().toISOString().split('T')[0];
            setForm(prev => ({ ...prev, join_date: today }));
          }
          setShowDatePicker(true);
        }} // open calendar modal with default today if empty
      >
        <Text style={styles.dateInput}>
          {form.join_date || 'Select Join Date'}
        </Text>
        <Ionicons
          name="calendar-outline"
          size={22}
          color="#1c2f87"
          style={styles.calendarIcon}
        />
      </TouchableOpacity>

      {errors.join_date && (
        <Text style={styles.errorText}>{errors.join_date}</Text>
      )}

      {/* Calendar Modal */}
      <CalendarModal
        visible={showDatePicker}
        selectedDate={form.join_date}
        onSelectDate={date => {
          setForm(prev => ({ ...prev, join_date: date }));
          if (errors.join_date) setErrors(prev => ({ ...prev, join_date: '' }));
          setShowDatePicker(false);
        }}
        onClose={() => setShowDatePicker(false)}
      />
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#1c2f87" />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Header / Selection Toolbar */}
      {selectionMode ? (
        <View style={styles.headerRow}>
          <Text
            style={styles.headerTitle}
          >{`${selectedIds.size} selected`}</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.viewToggleBtn}
              onPress={toggleSelectAll}
            >
              <Ionicons
                name={
                  employees.length > 0 &&
                  employees.every(e => selectedIds.has(e.employee?.id))
                    ? 'checkbox-outline'
                    : 'square-outline'
                }
                size={24}
                color="#1c2f87"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewToggleBtn}
              // onPress={() => setShowBulkDeleteModal(true)}
              onPress={() => {
                if (selectedIds.size > 0) {
                  setShowBulkDeleteModal(true);
                } else {
                  Toast.show({
                    type: 'error',
                    text1: 'No payment mode selected',
                    // text2: 'Please select at least one payment mode to delete.',
                  });
                }
              }}
            >
              <Ionicons name="trash-outline" size={24} color="#fe8c06" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={exitSelectionMode}>
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{t('List of Employees')}</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.viewToggleBtn}
              onPress={() =>
                setViewMode(prev => (prev === 'list' ? 'table' : 'list'))
              }
            >
              <Ionicons
                name={viewMode === 'list' ? 'grid-outline' : 'list-outline'}
                size={24}
                color="#1c2f87"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewToggleBtn, { marginRight: 8 }]}
              onPress={() => enterSelectionMode()}
            >
              <Ionicons name="checkbox-outline" size={24} color="#1c2f87" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setShowForm(true)}
            >
              <Ionicons name="add" size={26} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={16}
            color="#6c757d"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search employees by name, role ..."
            placeholderTextColor="#6c757d"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={16} color="#6c757d" />
            </TouchableOpacity>
          )}
        </View>
        {searchQuery.length > 0 && (
          <Text style={styles.searchResults}>
            {filteredEmployees.length} result
            {filteredEmployees.length !== 1 ? 's' : ''} found
          </Text>
        )}
      </View>

      {/* Employee List */}
      {viewMode === 'list' ? (
        <FlatList
          data={employees}
          // keyExtractor={item =>
          //   item?.id ? item.id.toString() : Math.random().toString()
          // }
          keyExtractor={item => item?.employee?.id?.toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#1c2f87']}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          renderItem={({ item }) => {
            // if (!item || !item.id) return null;

            return (
              <TouchableOpacity
                activeOpacity={0.9}
                onLongPress={() => enterSelectionMode(item.employee?.id)}
                onPress={() => {
                  if (selectionMode) toggleSelect(item.employee?.id);
                }}
                style={styles.employeeCard}
              >
                {selectionMode && (
                  <View style={{ marginRight: 8 }}>
                    <Ionicons
                      name={
                        selectedIds.has(item.employee?.id)
                          ? 'checkbox-outline'
                          : 'square-outline'
                      }
                      size={22}
                      color="#1c2f87"
                    />
                  </View>
                )}
                <View style={styles.employeeInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.empName}>{item.employee?.name}</Text>
                    <Text style={styles.empRole}>{item.employee?.role}</Text>
                  </View>

                  <View style={styles.detailsRow}>
                    <View style={styles.hotelBadge}>
                      <Ionicons name="business" size={15} color="#5e72e4" />
                      <Text style={styles.hotelName}>
                        {item.employee?.hotel?.name || 'No Hotel Assigned'}
                      </Text>
                    </View>

                    <View style={styles.contactRow}>
                      <Ionicons
                        name="call"
                        size={14}
                        color="#2dce89"
                        style={styles.contactIcon}
                      />
                      <Text style={styles.empMobile}>
                        {item?.employee?.mobile}
                      </Text>
                      {item.alt_mobile && (
                        <>
                          <Ionicons
                            name="call"
                            size={14}
                            color="#f5365c"
                            style={styles.contactIcon}
                          />
                          <Text style={styles.altMobile}>
                            {item.alt_mobile}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>
                {!selectionMode && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      onPress={() => handleEdit(item)}
                      style={styles.iconBtn}
                    >
                      <Ionicons
                        name="create-outline"
                        size={22}
                        color="#1c2f87"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(item?.employee?.id)}
                      style={styles.iconBtn}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={22}
                        color="#fe8c06"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchQuery.length > 0
                ? 'No employees found matching your search.'
                : t('No employees added yet.')}
            </Text>
          }
        />
      ) : (
        <TableView
          data={employees}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={() => {
            if (!selectionMode) enterSelectionMode();
            toggleSelectAll();
          }}
        />
      )}

      {/* Add/Edit Employee Modal */}
      {/* Add/Edit Employee Modal */}
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
                {editId ? 'Update Employee' : 'Add Employee'}
              </Text>
              <TouchableOpacity onPress={closeForm}>
                <Ionicons name="close" size={24} color="#1c2f87" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
            >
              {/* Personal Details Section */}
              <Text style={styles.section}>Personal Details</Text>
              {renderInput('name', 'Name', {
                placeholder: 'Enter name',
                autoCapitalize: 'words',
              })}
              {renderInput('email', 'Email', {
                placeholder: 'Enter email',
                keyboardType: 'email-address',
                autoCapitalize: 'none',
              })}
              {renderInput('mobile', 'Mobile Number', {
                placeholder: 'Enter mobile number',
                keyboardType: 'phone-pad',
                maxLength: 10,
                onChangeText: text =>
                  handleChange('mobile', text.replace(/[^0-9]/g, '')),
              })}
              {renderInput('alt_mobile', 'Alternate Mobile Number (Optional)', {
                placeholder: 'Enter alternate mobile number',
                keyboardType: 'phone-pad',
                maxLength: 10,
              })}
              {renderDropdown('role', 'Role', 'Select Role', [
                { label: 'Employee', value: 'Employee' },
                { label: 'Manager', value: 'Manager' },
                { label: 'Receptionist', value: 'Receptionist' },
              ])}

              {/* Only show System Access checkbox if role is Manager or Receptionist */}
              {(form.role === 'Manager' || form.role === 'Receptionist') && (
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginVertical: 8,
                  }}
                  onPress={() =>
                    handleChange('is_user', form.is_user === 1 ? 0 : 1)
                  }
                >
                  <Ionicons
                    name={
                      form.is_user === 1 ? 'checkbox-outline' : 'square-outline'
                    }
                    size={24}
                    color="#1c2f87"
                  />
                  <Text style={{ marginLeft: 8 }}>System Access</Text>
                </TouchableOpacity>
              )}

              {/* Only show Email + Password fields if System Access is checked */}
              {form.is_user === 1 &&
                (form.role === 'Manager' || form.role === 'Receptionist') && (
                  <>
                    {/* Email auto-fill */}
                    <View style={{ marginBottom: 12 }}>
                      <Text style={styles.label}>System Email</Text>
                      <TextInput
                        placeholder="System Email"
                        style={styles.input}
                        value={form.email}
                        editable={false}
                      />
                    </View>

                    {/* Password input with eye icon */}
                    <View
                      style={[styles.passwordContainer, { marginBottom: 12 }]}
                    >
                      <Text style={styles.label}>System Password</Text>
                      <View
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                      >
                        <TextInput
                          placeholder="Enter password"
                          style={[
                            styles.input,
                            errors.password && styles.inputError,
                            { flex: 1 },
                          ]}
                          secureTextEntry={!showPassword}
                          onChangeText={text => handleChange('password', text)}
                          value={form.password}
                        />
                        <TouchableOpacity
                          style={styles.eyeIcon}
                          onPress={() => setShowPassword(!showPassword)}
                        >
                          <Ionicons
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={24}
                            color="#1c2f87"
                          />
                        </TouchableOpacity>
                      </View>
                      {errors.password && (
                        <Text style={styles.errorText}>{errors.password}</Text>
                      )}
                      <Text style={{ fontSize: 12, color: '#888' }}>
                        Leave blank to keep current password
                      </Text>
                    </View>
                  </>
                )}

              {renderInput('salary', 'Salary', {
                placeholder: 'Enter salary',
                keyboardType: 'numeric',
              })}
              {renderDateInput()}

              {renderDropdown(
                'hotel',
                'Select Hotel',
                'Choose a hotel',
                hotelOptions,
              )}

              {/* Address Section */}
              <Text style={styles.section}>Address</Text>
              {renderInput('address_line', 'Address', {
                placeholder: 'Enter address',
                multiline: true,
                numberOfLines: 3,
              })}
              {renderInput('landmark', 'Landmark', {
                placeholder: 'Enter landmark',
                autoCapitalize: 'words',
              })}
              {renderInput('city', 'City', {
                placeholder: 'Enter city',
                autoCapitalize: 'words',
              })}
              {renderInput('taluka', 'Taluka', {
                placeholder: 'Enter taluka',
                autoCapitalize: 'words',
              })}
              {renderInput('district', 'District', {
                placeholder: 'Enter district',
                autoCapitalize: 'words',
              })}
              {renderInput('state', 'State', {
                placeholder: 'Enter state',
                autoCapitalize: 'words',
              })}
              {renderInput('pincode', 'Pincode', {
                placeholder: 'Enter pincode',
                keyboardType: 'numeric',
                maxLength: 6,
              })}

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
            </ScrollView>
          </View>
        </View>
      </Modal>

      <DeleteAlert
        visible={showDeleteModal}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Employee"
        message="Are you sure you want to delete this employee?"
      />
      <DeleteAlert
        visible={showBulkDeleteModal}
        onCancel={cancelBulkDelete}
        onConfirm={confirmBulkDelete}
        title="Delete Employees"
        message={`Are you sure you want to delete ${selectedIds.size} selected employee(s)?`}
      />
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
  employeeCard: {
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
  employeeInfo: {
    flex: 1,
    paddingRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  empName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c2f87',
    marginRight: 8,
  },
  empRole: {
    fontSize: 12,
    color: '#6c757d',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  detailsRow: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
    // marginVertical: 5
  },
  hotelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f5ff',
    paddingHorizontal: 8,
    marginVertical: 10,
    borderRadius: 6,
  },
  hotelName: {
    fontSize: 14,
    color: '#5e72e4',
    marginLeft: 4,
    fontWeight: '500',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIcon: {
    marginLeft: 8,
    marginRight: 4,
  },
  empMobile: {
    fontSize: 13,
    color: '#2dce89',
  },
  altMobile: {
    fontSize: 13,
    color: '#f5365c',
    marginLeft: 4,
  },
  empMobile: {
    fontSize: 13,
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
    maxHeight: '87%',
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
    paddingRight: 45,
  },
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    padding: 5,
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
  passwordFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 10,
  },
  uploadBtn: {
    backgroundColor: '#EFEFEF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadText: {
    color: '#1c2f87',
    fontWeight: '600',
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
  imageUploadContainer: {
    marginVertical: 6,
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  changeImageBtn: {
    backgroundColor: '#fe8c06',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  changeImageText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  uploadBtn: {
    backgroundColor: '#EFEFEF',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  uploadText: {
    color: '#1c2f87',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 8,
  },
  imagePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    width: '80%',
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  imagePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  imagePickerTitle: {
    fontSize: 18,
    color: '#1c2f87',
    fontFamily: 'Poppins-Bold',
  },
  imagePickerOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  imagePickerOption: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    minWidth: 120,
  },
  imagePickerOptionText: {
    marginTop: 8,
    fontSize: 14,
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewToggleBtn: {
    marginRight: 12,
    padding: 4,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tableContentContainer: {
    marginBottom: 20,
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
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 32,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1c2f87',
    fontFamily: 'Poppins-Regular',
    paddingVertical: 1,
  },
  clearButton: {
    padding: 4,
  },
  searchResults: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
    marginTop: 8,
    marginLeft: 4,
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
  loadingFooter: {
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1c2f87',
    marginBottom: 2,
    fontFamily: 'Poppins-Regular',
  },
});
