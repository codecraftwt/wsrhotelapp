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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEmployees,
  addEmployee,
  deleteEmployee,
  updateEmployee,
} from '../../redux/slices/employeeSlice';
import { fetchHotels } from '../../redux/slices/hotelSlice';
import DropdownField from '../../components/DropdownField';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

// Form validation rules
const VALIDATION_RULES = {
  name: { required: true, minLength: 2, maxLength: 50 },
  mobile: { required: true, pattern: /^[6-9]\d{9}$/ },
  role: { required: true, minLength: 2, maxLength: 30 },
  salary: { required: true, pattern: /^\d+$/ },
  join_date: { required: true },
  // hotel: { required: true, minLength: 2, maxLength: 50 },
  address_line: { required: true, minLength: 10, maxLength: 200 },
  landmark: { required: true, minLength: 2, maxLength: 50 },
  city: { required: true, minLength: 2, maxLength: 30 },
  taluka: { required: true, minLength: 2, maxLength: 30 },
  district: { required: true, minLength: 2, maxLength: 30 },
  state: { required: true, minLength: 2, maxLength: 30 },
  pincode: { required: true, pattern: /^[1-9][0-9]{5}$/ },
};

const TableView = ({ data, onEdit, onDelete }) => {
  const scrollViewRef = useRef(null);
  // console.log("items",  item);

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
              Employee Name
            </Text>
            <Text style={[styles.tableHeaderCell, { width: 120 }]}>Role</Text>
            <Text style={[styles.tableHeaderCell, { width: 120 }]}>Mobile</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>Salary</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>Join Date</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>
              Actions
            </Text>
          </View>

          {/* Table Content */}
          <View>
            
            
            {data.map(item => (
              
              <View key={item.id.toString()} style={styles.tableRow}>
                
                <Text style={[styles.tableCell, { width: 150 }]}>
                  {item.name}
                </Text>
                <Text style={[styles.tableCell, { width: 120 }]}>
                  {item.role}
                </Text>
                <Text style={[styles.tableCell, { width: 120 }]}>
                  {item.mobile}
                </Text>
                <Text style={[styles.tableCell, { width: 100 }]}>
                  ₹{item.salary}
                </Text>
                <Text style={[styles.tableCell, { width: 100 }]}>
                  {item.join_date}
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

export default function AddEmployeeScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { employees, loading } = useSelector(state => state.employee);
  const { hotels } = useSelector(state => state.hotel);
  // Hotel options for dropdown
  // console.log("hotels-->", hotels)
  const hotelOptions = hotels.map(hotel => (
    {
      value: hotel?.id,
      label: hotel?.name,
    }));

  // Form state
  const [form, setForm] = useState({
    name: '',
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
    documents: '',
  });

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  console.log(filteredEmployees);  

  // Load employees on component mount
  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchHotels());
  }, [dispatch]);

  // Filter employees based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(employee =>
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.mobile.includes(searchQuery) ||
        employee.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [searchQuery, employees]);

  // Handle search input change
  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Form validation function
  const validateForm = () => {
    const newErrors = {};

    Object.keys(VALIDATION_RULES).forEach(field => {
      const value = form[field];
      const rules = VALIDATION_RULES[field];

      // Required field validation
      if (rules.required && (!value || value.trim() === '')) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)
          } is required`;
        return;
      }

      if (value && value.trim() !== '') {
        // Length validation
        if (rules.minLength && value.length < rules.minLength) {
          newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)
            } must be at least ${rules.minLength} characters`;
        } else if (rules.maxLength && value.length > rules.maxLength) {
          newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)
            } must be less than ${rules.maxLength} characters`;
        }

        // Pattern validation
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

  // Request camera permission for Android
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Handle camera capture
  const handleCameraCapture = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Camera permission is required to take photos.',
      );
      return;
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    try {
      const result = await launchCamera(options);
      if (result.assets && result.assets[0]) {
        setProfileImage(result.assets[0]);
        setShowImagePicker(false);
      }
    } catch (error) {
      console.log('Camera error:', error);
    }
  };

  // Handle gallery selection
  const handleGallerySelect = async () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    try {
      const result = await launchImageLibrary(options);
      if (result.assets && result.assets[0]) {
        setProfileImage(result.assets[0]);
        setShowImagePicker(false);
      }
    } catch (error) {
      console.log('Gallery error:', error);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!form.hotel) {
      Alert.alert('Please select a hotel');
      return;
    }

    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }
    console.log("form", form)

    const employeeData = {
      ...form,
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      alt_mobile: form.alt_mobile.trim(),
      hotel_id: form?.hotel,
      role: form.role.trim(),
      address_line: form.address_line.trim(),
      landmark: form.landmark.trim(),
      city: form.city.trim(),
      taluka: form.taluka.trim(),
      district: form.district.trim(),
      state: form.state.trim(),
      join_date: form.join_date.trim(),
    };
    console.log("employeeData ---->", employeeData);
    

    if (editId) {
      dispatch(updateEmployee({ ...employeeData, id: editId }));
      dispatch(fetchEmployees());
      dispatch(fetchHotels());
    } else {
      dispatch(addEmployee(employeeData));
    }

    closeForm();
  };

  // Handle edit employee
  const handleEdit = emp => {
    setForm({ ...emp });
    setEditId(emp.id);
    setShowForm(true);
    setErrors({});
    setProfileImage(emp.profileImage || null);
  };

  // Handle delete employee
  const handleDelete = id => {
    Alert.alert(
      'Delete Employee',
      'Are you sure you want to delete this employee?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteEmployee(id)),
        },
      ],
    );
  };

  // Close form and reset state
  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setErrors({});
    setProfileImage(null);
    setForm({
      name: '',
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
      documents: '',
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
      onSelect={selectedItem => handleDropdownSelect(field, selectedItem)}
      error={errors[field]}
    />
  );

  // Render profile image upload
  const renderProfileImageUpload = () => (
    <View style={styles.imageUploadContainer}>
      {profileImage ? (
        <View style={styles.imagePreviewContainer}>
          <Image
            source={{ uri: profileImage.uri }}
            style={styles.imagePreview}
          />
          <TouchableOpacity
            style={styles.changeImageBtn}
            onPress={() => setShowImagePicker(true)}
          >
            <Text style={styles.changeImageText}>Change Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => setShowImagePicker(true)}
        >
          <Ionicons name="camera-outline" size={24} color="#1c2f87" />
          <Text style={styles.uploadText}>{t('Upload Profile Image')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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
          <Ionicons name="search" size={16} color="#6c757d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search employees by name, role, mobile or city..."
            placeholderTextColor="#6c757d"
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={16} color="#6c757d" />
            </TouchableOpacity>
          )}
        </View>
        {searchQuery.length > 0 && (
          <Text style={styles.searchResults}>
            {filteredEmployees.length} result{filteredEmployees.length !== 1 ? 's' : ''} found
          </Text>
        )}
      </View>

      {/* Employee List */}
      {viewMode === 'list' ? (
        <FlatList
          data={filteredEmployees}         
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={() => dispatch(fetchEmployees())}
          renderItem={({ item }) => (
            <View style={styles.employeeCard}>
              <View style={styles.employeeInfo}>
                <Text style={styles.empName}>{item.name}</Text>
                <Text style={styles.empRole}>{item.role}</Text>
                <Text style={styles.empMobile}>{item.mobile}</Text>
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
            <Text style={styles.emptyText}>
              {searchQuery.length > 0 ? 'No employees found matching your search.' : t('No employees added yet.')}
            </Text>
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.tableScrollView}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => dispatch(fetchEmployees())}
              colors={['#1c2f87']}
              tintColor="#1c2f87"
            />
          }
        >
          <TableView
            data={filteredEmployees}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          {filteredEmployees.length === 0 && (
            <Text style={styles.emptyText}>
              {searchQuery.length > 0 ? 'No employees found matching your search.' : t('No employees added yet.')}
            </Text>
          )}
        </ScrollView>
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
              {renderInput('mobile', t('Mobile Number'), {
                keyboardType: 'phone-pad',
                maxLength: 10,
              })}
              {renderInput(
                'alt_mobile',
                t('Alternate Mobile Number (Optional)'),
                { keyboardType: 'phone-pad', maxLength: 10 },
              )}
              {renderInput('role', t('Role'), { autoCapitalize: 'words' })}
              {renderInput('salary', t('Salary'), { keyboardType: 'numeric' })}
              {renderInput('join_date', t('Join Date'), {
                placeholder: 'DD/MM/YYYY',
              })}
              {renderDropdown(
                'hotel',
                'Select Hotel',
                'Choose a hotel',
                hotelOptions,
              )}

              {/* Address Section */}
              <Text style={styles.section}>Address</Text>
              {renderInput('address_line', t('Address'), {
                multiline: true,
                numberOfLines: 3,
              })}
              {renderInput('landmark', t('Landmark'), {
                autoCapitalize: 'words',
              })}
              {renderInput('city', t('City'), { autoCapitalize: 'words' })}
              {renderInput('taluka', t('Taluka'), { autoCapitalize: 'words' })}
              {renderInput('district', t('District'), {
                autoCapitalize: 'words',
              })}
              {renderInput('state', t('State'), { autoCapitalize: 'words' })}
              {renderInput('pincode', t('Pincode'), {
                keyboardType: 'numeric',
                maxLength: 6,
              })}

              {/* Profile Image Upload Section */}
              <Text style={styles.section}>{t('Profile Image')}</Text>
              {renderProfileImageUpload()}

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

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <View style={styles.imagePickerOverlay}>
          <View style={styles.imagePickerContent}>
            <View style={styles.imagePickerHeader}>
              <Text style={styles.imagePickerTitle}>Select Photo</Text>
              <TouchableOpacity onPress={() => setShowImagePicker(false)}>
                <Ionicons name="close" size={24} color="#1c2f87" />
              </TouchableOpacity>
            </View>

            <View style={styles.imagePickerOptions}>
              <TouchableOpacity
                style={styles.imagePickerOption}
                onPress={handleCameraCapture}
              >
                <Ionicons name="camera" size={32} color="#1c2f87" />
                <Text style={styles.imagePickerOptionText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.imagePickerOption}
                onPress={handleGallerySelect}
              >
                <Ionicons name="images" size={32} color="#1c2f87" />
                <Text style={styles.imagePickerOptionText}>
                  Choose from Gallery
                </Text>
              </TouchableOpacity>
            </View>
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
  },
  empName: {
    fontSize: 16,
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
  },
  empRole: {
    fontSize: 13,
    color: '#fe8c06',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
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
  tableScrollView: {
    flexGrow: 1,
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
  // Search Bar Styles
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
});
