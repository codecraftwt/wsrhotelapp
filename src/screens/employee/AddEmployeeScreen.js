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
} from '../../redux/slices/employeeSlice';
import { fetchHotels } from '../../redux/slices/hotelSlice';
import DropdownField from '../../components/DropdownField';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import DeleteAlert from '../../components/DeleteAlert';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  // landmark: { required: true, minLength: 2, maxLength: 50 },
  // city: { required: true, minLength: 2, maxLength: 30 },
  // taluka: { required: true, minLength: 2, maxLength: 30 },
  // district: { required: true, minLength: 2, maxLength: 30 },
  // state: { required: true, minLength: 2, maxLength: 30 },
  // pincode: { required: true, pattern: /^[1-9][0-9]{5}$/ },
};

const TableView = ({
  data,
  onEdit,
  onDelete,
  loading,
  hasMore,
  onLoadMore,
  onRefresh,
  isRefreshing
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
          <Text style={[styles.tableHeaderCell, { width: 150 }]}>Employee Name</Text>
          <Text style={[styles.tableHeaderCell, { width: 120 }]}>Role</Text>
          <Text style={[styles.tableHeaderCell, { width: 120 }]}>Mobile</Text>
          <Text style={[styles.tableHeaderCell, { width: 100 }]}>Salary</Text>
          <Text style={[styles.tableHeaderCell, { width: 100 }]}>Join Date</Text>
          <Text style={[styles.tableHeaderCell, { width: 150 }]}>Hotel</Text>
          <Text style={[styles.tableHeaderCell, { width: 100 }]}>Actions</Text>
        </View>

        {/* Scrollable Rows */}
        <FlatList
          data={data}
          keyExtractor={(item) => item?.id?.toString()}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: 150 }]}>{item?.name}</Text>
              <Text style={[styles.tableCell, { width: 120 }]}>{item?.role}</Text>
              <Text style={[styles.tableCell, { width: 120 }]}>{item?.mobile}</Text>
              <Text style={[styles.tableCell, { width: 100 }]}>₹{item?.salary}</Text>
              <Text style={[styles.tableCell, { width: 100 }]}>{item?.join_date}</Text>
              <Text style={[styles.tableCell, { width: 150 }]}>{item?.hotel?.name || 'N/A'}</Text>
              <View style={[styles.tableActions, { width: 100 }]}>
                <TouchableOpacity onPress={() => onEdit(item)}>
                  <Ionicons name="create-outline" size={20} color="#1c2f87" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(item.id)}>
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

  const {
    employees,
    loading,
    page,
    perPage,
    hasMore,
    error
  } = useSelector(state => state.employee);
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

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      dispatch(resetEmployees());
      dispatch(fetchEmployees({ page: 1, per_page: perPage }));
    } else {
      const debounceTimer = setTimeout(() => {
        dispatch(resetEmployees());
        dispatch(fetchEmployees({
          page: 1,
          per_page: perPage,
          search: searchQuery
        }));
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
    if (!hasMore || loading) return;

    try {
      await dispatch(fetchEmployees({
        page: page + 1,
        per_page: perPage,
        search: searchQuery
      }));
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
      const value = form[field];
      const rules = VALIDATION_RULES[field];
      if (rules.required && (!value || value.trim() === '')) {
      // Custom error messages for specific fields
      if (field === 'address_line') {
        newErrors[field] = 'Address is required';
      } else if (field === 'join_date') {
        newErrors[field] = 'Date is required'; // Custom error for join_date
      } else {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
      return;
    }

      // if (rules.required && (!value || value.trim() === '')) {
      //   newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      //   return;
      // }

  

      if (value && value.trim() !== '') {
        if (rules.minLength && value.length < rules.minLength) {
          newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)
            } must be at least ${rules.minLength} characters`;
        } else if (rules.maxLength && value.length > rules.maxLength) {
          newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)
            } must be less than ${rules.maxLength} characters`;
        }

        if (rules.pattern && !rules.pattern.test(value)) {
          if (field === 'mobile') {
            newErrors[field] = 'Please enter a valid 10-digit mobile number';
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
    return Object.keys(newErrors).length === 0;
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
    // if (!form.hotel) {
    //   Alert.alert('Please select a hotel');
    //   return;
    // }
    if (!validateForm()) {
      // Alert.alert('Validation Error', 'Please fix the errors in the form');
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
        };
        await dispatch(updateEmployee(employeeData)).unwrap();
        closeForm();
        Toast.show({
      type: 'success',
      text1: 'updated successfully',
    });
        // Alert.alert('Success', 'Employee updated successfully!');
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

        await dispatch(addEmployee(formData)).unwrap();
        closeForm();
        Toast.show({
      type: 'success',
      text1: 'added successfully',
    });
      }
      dispatch(resetEmployees());
      await dispatch(fetchEmployees({
        page: 1,
        per_page: perPage,
        search: searchQuery
      }));

      closeForm();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleEdit = emp => {
    setForm({
      name: emp.name || '',
      email: emp.email || '',
      mobile: emp.mobile || '',
      alt_mobile: emp.alt_mobile || '',
      hotel: emp.hotel_id || emp.hotel?.id || '',
      role: emp.role || '',
      salary: emp.salary ? String(emp.salary) : '',
      join_date: emp.join_date || '',
      address_line: emp.address_line || '',
      landmark: emp.landmark || '',
      city: emp.city || '',
      taluka: emp.taluka || '',
      district: emp.district || '',
      state: emp.state || '',
      pincode: emp.pincode || '',
    });
    setEditId(emp.id);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = id => {
    setSelectedEmployeeId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!selectedEmployeeId) return;

    dispatch(deleteEmployee(selectedEmployeeId));
    Toast.show({
      type: 'success',
      text1: 'Deleted successfully',
    });

    setShowDeleteModal(false);
    setSelectedEmployeeId(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedEmployeeId(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setErrors({});
    setProfileImage(null);
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
    });
  };

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
      <Text style={styles.label}>Join Date</Text>
      <TouchableOpacity
        style={[styles.dateInputContainer, errors.join_date && styles.inputError]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateInput}>{form.join_date || 'Select Date'}</Text>
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

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
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
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>{t('List of Employees')}</Text>
        <View style={styles.headerButtons}>
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
            placeholder="Search employees by name, role, mobile or city..."
            placeholderTextColor="#6c757d"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
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
          keyExtractor={item => item?.id ? item.id.toString() : Math.random().toString()}
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
            if (!item || !item.id) return null;

            return (
              <View style={styles.employeeCard}>
                <View style={styles.employeeInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.empName}>{item.name}</Text>
                    <Text style={styles.empRole}>{item.role}</Text>
                  </View>

                  <View style={styles.detailsRow}>
                    <View style={styles.hotelBadge}>
                      <Ionicons name="business" size={15} color="#5e72e4" />
                      <Text style={styles.hotelName}>{item.hotel?.name || 'No Hotel Assigned'}</Text>
                    </View>

                    <View style={styles.contactRow}>
                      <Ionicons name="call" size={14} color="#2dce89" style={styles.contactIcon} />
                      <Text style={styles.empMobile}>{item.mobile}</Text>
                      {item.alt_mobile && (
                        <>
                          <Ionicons name="call" size={14} color="#f5365c" style={styles.contactIcon} />
                          <Text style={styles.altMobile}>{item.alt_mobile}</Text>
                        </>
                      )}
                    </View>
                  </View>
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
        />
      )}

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
                {editId ? t('Update Employee') : t('Add Employee')}
              </Text>
              <TouchableOpacity onPress={closeForm}>
                <Ionicons name="close" size={24} color="#1c2f87" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Personal Details Section */}
              <Text style={styles.section}>Personal Details</Text>
              {renderInput('name', t('Name'), { autoCapitalize: 'words' })}
              {renderInput('email', t('Email'), { keyboardType: 'email-address', autoCapitalize: 'none' })}
              {renderInput('mobile', t('Mobile Number'), { keyboardType: 'phone-pad', maxLength: 10 })}
              {renderInput('alt_mobile', t('Alternate Mobile Number (Optional)'), { keyboardType: 'phone-pad', maxLength: 10 })}
              {renderInput('role', t('Role'), { autoCapitalize: 'words' })}
              {renderInput('salary', t('Salary'), { keyboardType: 'numeric' })}
              {renderDateInput()}

              {renderDropdown('hotel', 'Select Hotel', 'Choose a hotel', hotelOptions)}

              {/* Address Section */}
              <Text style={styles.section}>Address</Text>
              {renderInput('address_line', t('Address'), { multiline: true, numberOfLines: 3 })}
              {renderInput('landmark', t('Landmark'), { autoCapitalize: 'words' })}
              {renderInput('city', t('City'), { autoCapitalize: 'words' })}
              {renderInput('taluka', t('Taluka'), { autoCapitalize: 'words' })}
              {renderInput('district', t('District'), { autoCapitalize: 'words' })}
              {renderInput('state', t('State'), { autoCapitalize: 'words' })}
              {renderInput('pincode', t('Pincode'), { keyboardType: 'numeric', maxLength: 6 })}

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
      <DeleteAlert
        visible={showDeleteModal}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Employee"
        message="Are you sure you want to delete this employee?"
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
    width: '100%',
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
    fontSize: 14,
    color: '#1c2f87',
    marginBottom: 4,
    fontFamily: 'Poppins-Regular',
  },
});