import React, { useEffect, useState, useRef } from 'react';
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
  ScrollView,
  RefreshControl,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import {
  addMaterialItem,
  deleteMaterialItem,
  editMaterialItem,
  fetchMaterialItems,
} from '../../redux/slices/materialItemsSlice';
import DropdownField from '../../components/DropdownField';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchHotels } from '../../redux/slices/hotelSlice';

const VALIDATION_RULES = {
  name: { required: true, minLength: 2, maxLength: 100 },
};

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
            <Text style={[styles.tableHeaderCell, { width: 250 }]}>
              Material Name
            </Text>
            <Text style={[styles.tableHeaderCell, { width: 250 }]}>
              Unit
            </Text>
            <Text style={[styles.tableHeaderCell, { width: 150 }]}>
              Actions
            </Text>
          </View>

          {/* Table Content */}
          <View>
            {data.map(item => (
              <View key={item.id.toString()} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: 250 }]}>
                  {item?.name}
                </Text>
                <Text style={[styles.tableCell, { width: 250 }]}>
                  {item?.unit}
                </Text>
                <View style={[styles.tableActions, { width: 150 }]}>
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

export default function MaterialsScreen() {
  const materials = useSelector(state => state.materialItems.materialItems);
  const loading = useSelector(state => state.materialItems.loading);
  const error = useSelector(state => state.materialItems.error);
  const dispatch = useDispatch();

  const hotels = useSelector(state => state.hotel.hotels);
  const hotelsLoading = useSelector(state => state.hotel.loading);

  // Fetch materials on mount
  useEffect(() => {
    dispatch(fetchMaterialItems());
    dispatch(fetchHotels());
  }, [dispatch]);

  // const [loading, setLoading] = useState(false);

  // Form state
  // const [form, setForm] = useState({ name: '', hotel_id: '', date: '' });
  const [form, setForm] = useState({
    name: '',
    unit: '',
    status: '', // 👈 include this
    date: '',
  });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMaterials, setFilteredMaterials] = useState([]);

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Filter materials based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMaterials(materials);
    } else {
      const filtered = materials.filter(material =>
        material.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredMaterials(filtered);
    }
  }, [searchQuery, materials]);

  // Handle search input change
  const handleSearchChange = text => {
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
      }
    });
    // if (!form.hotel_id) newErrors.hotel_id = 'Hotel is required';
    if (!form.date) newErrors.date = 'Date is required';
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

  // Date picker handler
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0];
      handleChange('date', formatted);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    const materialData = {
      ...form,
      name: form.name.trim(),
    };

    try {
      if (editId) {
        // Update existing material
        await dispatch(editMaterialItem(materialData)).unwrap();
      } else {
        // Add new material
        await dispatch(addMaterialItem(materialData)).unwrap();
      }
      // Refresh the list after successful operation
      await dispatch(fetchMaterialItems());
      closeForm();
    } catch (error) {
      Alert.alert('Error', error.message || 'Operation failed');
    }
  };

  // Handle edit material
  const handleEdit = material => {
    setForm({ ...material });
    setEditId(material.id);
    setShowForm(true);
    setErrors({});
  };

  // Handle delete material
  const handleDelete = async id => {
    Alert.alert(
      'Delete Material',
      'Are you sure you want to delete this material?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteMaterialItem(id)).unwrap();
              // Refresh the list after successful deletion
              await dispatch(fetchMaterialItems());
            } catch (error) {
              Alert.alert(
                'Error',
                error.message || 'Failed to delete material',
              );
            }
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
    setForm({ name: '', date: '' });
  };

  // Refresh data
  const handleRefresh = () => {
    dispatch(fetchMaterialItems());
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Materials</Text>
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
          <Ionicons
            name="search"
            size={16}
            color="#6c757d"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search materials..."
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
            {filteredMaterials.length} result
            {filteredMaterials.length !== 1 ? 's' : ''} found
          </Text>
        )}
      </View>

      {/* Materials List */}
      {viewMode === 'list' ? (
        <FlatList
          data={filteredMaterials}
          keyExtractor={item => item?.id?.toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={handleRefresh}
          renderItem={({ item }) => (
            <View style={styles.materialCard}>
              <View style={styles.materialInfo}>
                <Text style={styles.materialName}>{item.name}</Text>
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
              {searchQuery.length > 0
                ? 'No materials found matching your search.'
                : 'No materials added yet.'}
            </Text>
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.tableScrollView}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleRefresh}
              colors={['#1c2f87']}
              tintColor="#1c2f87"
            />
          }
        >
          <TableView
            data={filteredMaterials}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          {filteredMaterials.length === 0 && (
            <Text style={styles.emptyText}>
              {searchQuery.length > 0
                ? 'No materials found matching your search.'
                : 'No materials added yet.'}
            </Text>
          )}
        </ScrollView>
      )}

      {/* Add/Edit Material Modal */}
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
                {editId ? 'Update Material' : 'Add Material'}
              </Text>
              <TouchableOpacity onPress={closeForm}>
                <Ionicons name="close" size={24} color="#1c2f87" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View>
                <Text style={styles.section}>Material Details</Text>
                {renderInput('name', 'Material Name', {
                  autoCapitalize: 'words',
                })}
                {/* Hotel and Date Row */}
                {/* <View style={{ flexDirection: 'row', gap: 10 }}> */}
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.label}>Unit</Text>
                  <DropdownField
                    label="Unit"
                    placeholder="Select unit"
                    value={form.unit}
                    onSelect={item => handleChange('unit', item.value)}
                    options={['kg', 'gm', 'ltr', 'ml', 'pcs'].map(unit => ({
                      label: unit.toLowerCase(),
                      value: unit,
                    }))}
                  />
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.label}>Status</Text>
                    <DropdownField
                      label="Status"
                      placeholder="Select status"
                      value={form.status}
                      onSelect={item => handleChange('status', item.value)}
                      options={['Pending', 'Completed'].map(status => ({
                        label: status,
                        value: status, // "pending", "completed"
                      }))}
                    />
                  </View>

                  {/* </View> */}
                  <View>
                    <Text style={styles.label}>Date</Text>
                    <TouchableOpacity
                      style={[
                        styles.input,
                        {
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        },
                      ]}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          color: form.date ? '#1c2f87' : '#888',
                        }}
                      >
                        {form.date ? form.date : 'Select date'}
                      </Text>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color="#fe8c06"
                      />
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={form.date ? new Date(form.date) : new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                      />
                    )}
                    {errors.date && (
                      <Text style={styles.errorText}>{errors.date}</Text>
                    )}
                  </View>
                </View>
                {/* Form Action Buttons */}
                <View style={styles.formBtnRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={closeForm}
                  >
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
  materialCard: {
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
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 16,
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
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
    padding: 12,
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
  label: {
    fontSize: 14,
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
});
