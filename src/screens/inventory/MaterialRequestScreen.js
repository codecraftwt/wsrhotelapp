// MaterialRequestScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { InputField } from '../../components/InputField';
import DropdownField from '../../components/DropdownField';
import { PrimaryButton } from '../../components/PrimaryButton';
import DeleteAlert from '../../components/DeleteAlert';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  fetchAllMaterials,
  addMaterial,
  updateMaterial,
  deleteMaterial,
  resetMaterials,
} from '../../redux/slices/materialSlice';
import { fetchHotels } from '../../redux/slices/hotelSlice';
import { fetchEmployees } from '../../redux/slices/employeeSlice';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../api/axiosInstance';
import {
  showValidationError,
  showSaveSuccess,
  showUpdateSuccess,
  showSaveError,
} from '../../utils/toastUtils';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const VALIDATION_RULES = {
  hotelId: { required: true },
  materialId: { required: true },
  quantity: { required: true, pattern: /^\d+(\.\d{1,2})?$/ },
  date: { required: true },
  remark: { required: true },
  status: { required: false }, // Only required when editing
};

const TableView = ({
  data,
  onEdit,
  onDelete,
  onEndReached,
  loading,
  hasMore,
  refreshing,
  onRefresh,
}) => {
  const renderFooter = () => {
    if (!loading || !hasMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#1c2f87" />
        <Text style={styles.loadingText}>Loading more items...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return <Text style={styles.emptyText}>No material requests found.</Text>;
  };

  return (
    <View style={styles.tableContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1c2f87']}
          />
        }
      >
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: 150 }]}>
              Material
            </Text>
            <Text style={[styles.tableHeaderCell, { width: 150 }]}>Hotel</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>
              Quantity
            </Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>Unit</Text>
            <Text style={[styles.tableHeaderCell, { width: 120 }]}>
              Request Date
            </Text>
            <Text style={[styles.tableHeaderCell, { width: 150 }]}>Remark</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>Status</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>
              Actions
            </Text>
          </View>
          <FlatList
            data={data}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: 150 }]}>
                  {item.material?.name || 'N/A'}
                </Text>
                <Text style={[styles.tableCell, { width: 150 }]}>
                  {item.hotel?.name || 'N/A'}
                </Text>
                <Text style={[styles.tableCell, { width: 100 }]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.tableCell, { width: 100 }]}>
                  {item.unit}
                </Text>
                <Text style={[styles.tableCell, { width: 120 }]}>
                  {item.request_date}
                </Text>
                <Text style={[styles.tableCell, { width: 150 }]}>
                  {item.remark}
                </Text>
                <View style={[styles.tableCell, { width: 100 }]}>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          item.status === 'pending'
                            ? '#ffc107'
                            : item.status === 'completed'
                            ? '#28a745'
                            : '#6c757d',
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
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
            onEndReached={hasMore ? onEndReached : null}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const MaterialRequestScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { materials, loading, error, page, hasMore } = useSelector(
    state => state.material,
  );
  const { hotels, loading: hotelsLoading } = useSelector(state => state.hotel);
  const { employees = [], loading: employeesLoading } = useSelector(
    state => state.employee,
  );

  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    hotel_id: '', // Store the ID
    hotel_name: '',
    status: '',
    from_date: '',
    to_date: '',
  });

  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [form, setForm] = useState({
    id: null,
    materialId: '',
    materialName: '',
    quantity: '',
    hotelId: '',
    status: '',
    remark: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    unit: '',
  });
  const [errors, setErrors] = useState({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [allMaterials, setAllMaterials] = useState([]);
  const perPage = 20;
  const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await dispatch(fetchAllMaterials({ page: 1, per_page: perPage }));
        await dispatch(fetchHotels());
        await dispatch(fetchEmployees());

        const res = await api.get('materials');
        setAllMaterials(res.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch initial data', err);
      }
    };

    fetchInitialData();
  }, [dispatch]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      dispatch(
        fetchAllMaterials({
          ...filters,
          page: page + 1,
          per_page: perPage,
        }),
      );
    }
  };

  const applyFilters = () => {
    if (
      filters.from_date &&
      filters.to_date &&
      new Date(filters.from_date) > new Date(filters.to_date)
    ) {
      Alert.alert('Error', 'From date must be before To date');
      return;
    }

    setFilterModalVisible(false);
    dispatch(resetMaterials());
    dispatch(
      fetchAllMaterials({
        hotel_name: filters.hotel_name,
        status: filters.status,
        from_date: filters.from_date,
        to_date: filters.to_date,
        page: 1,
        per_page: perPage,
      }),
    );
  };

  const clearFilters = () => {
    setFilters({
      hotel_name: '',
      status: '',
      from_date: '',
      to_date: '',
    });
    setFilterModalVisible(false);
    dispatch(resetMaterials());
    dispatch(
      fetchAllMaterials({
        page: 1,
        per_page: perPage,
      }),
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(
        fetchAllMaterials({
          ...filters,
          page: 1,
          per_page: perPage,
        }),
      );
      const res = await api.get('materials');
      setAllMaterials(res.data?.data || []);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleChange('date', formattedDate);
    }
  };

  const handleChange = (field, val) => {
    if (field === 'hotelId') {
      setForm(prev => ({
        ...prev,
        hotelId: val,
        materialId: '',
        materialName: '',
      }));
    } else {
      setForm(prev => ({ ...prev, [field]: val }));
    }
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(VALIDATION_RULES).forEach(field => {
      const value = form[field];
      const rules = VALIDATION_RULES[field];

      // Skip validation for status if not editing
      if (field === 'status' && !form.id) {
        return;
      }

      if (rules.required && (!value || String(value).trim() === '')) {
        // Custom error messages for dropdown fields
        if (field === 'hotelId') {
          newErrors[field] = 'Please select a hotel';
        } else if (field === 'materialId') {
          newErrors[field] = 'Please select a material';
        } else if (field === 'remark') {
          newErrors[field] = 'Please select a remark';
        } else if (field === 'status') {
          newErrors[field] = 'Please select a status';
        } else if (field === 'date') {
          newErrors[field] = 'Please select a date';
        } else {
          newErrors[field] = `${field
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())} is required`;
        }
        return;
      }

      if (value && String(value).trim() !== '') {
        if (rules.minLength && value.length < rules.minLength) {
          newErrors[field] = `${field
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())} must be at least ${
            rules.minLength
          } characters`;
        } else if (rules.maxLength && value.length > rules.maxLength) {
          newErrors[field] = `${field
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())} must be less than ${
            rules.maxLength
          } characters`;
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          if (field === 'quantity') {
            newErrors[field] = 'Please enter a valid quantity (numbers only)';
          }
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFilterChange = (field, val) => {
    setFilters(prev => ({ ...prev, [field]: val }));
  };

  const handleEdit = item => {
    const selectedMaterial = allMaterials.find(
      mat => mat.id === item.material_id,
    );
    setForm({
      id: item.id,
      hotelId: item.hotel_id,
      materialId: item.material_id,
      materialName: item.material?.name || '',
      quantity: item.quantity,
      remark: item.remark,
      description: item.description || '',
      status: item.status || '',
      date: item.request_date,
      unit: selectedMaterial?.unit || '',
    });
    setErrors({}); // Clear errors when editing
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showValidationError();
      return;
    }

    const userId = 1;
    const selectedMaterial = allMaterials.find(
      mat => mat.id === form.materialId,
    );
    const payload = {
      id: form.id,
      hotel_id: form.hotelId,
      material_id: form.materialId,
      requested_by: userId,
      quantity: parseFloat(form.quantity),
      unit: selectedMaterial?.unit || '',
      remark: form.remark,
      description: form.description,
      request_date: form.date,
      ...(form.id ? { status: form.status } : {}),
    };

    try {
      let action;
      if (form?.id) {
        action = await dispatch(updateMaterial(payload));
      } else {
        action = await dispatch(addMaterial(payload));
      }

      if (action.payload) {
        if (form.id) {
          Toast.show({
            type: 'success',
            text1: 'Updated successfully',
          });
        } else {
          Toast.show({
            type: 'success',
            text1: 'Added successfully',
          });
        }
        setModalVisible(false);
        dispatch(fetchAllMaterials({ page: 1, per_page: perPage }));
      }
    } catch (error) {
      showSaveError('Material Request');
    }
  };

  const handleDelete = id => {
    setMaterialToDelete(id);
    setIsDeleteAlertVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteMaterial(materialToDelete));
      dispatch(fetchAllMaterials({ page: 1, per_page: perPage }));
      Toast.show({
        type: 'success',
        text1: 'Deleted successfully',
      });
      setIsDeleteAlertVisible(false);
      setMaterialToDelete(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete material');
      setIsDeleteAlertVisible(false);
      setMaterialToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteAlertVisible(false);
    setMaterialToDelete(null);
  };

  const renderMaterialItem = ({ item }) => {
    return (
      <View style={styles.materialItem}>
        <View style={styles.materialInfo}>
          <Text style={styles.materialName}>
            {item.material?.name || 'N/A'}
          </Text>
          <Text style={styles.materialDetails}>
            Hotel: {item.hotel?.name || 'N/A'}
          </Text>
          <Text style={styles.materialDetails}>Quantity: {item.quantity}</Text>
          <Text style={styles.materialDetails}>
            Requested: {item.request_date}
          </Text>
          <Text style={styles.materialDetails}>Remark: {item.remark}</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === 'pending'
                    ? '#ffc107'
                    : item.status === 'completed'
                    ? '#28a745'
                    : '#6c757d',
              },
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => handleEdit(item)}>
            <Ionicons name="create-outline" size={22} color="#1c2f87" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={22} color="#fe8c06" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const hotelOptions =
    hotels?.map(hotel => ({
      value: hotel.id,
      label: hotel.name,
    })) || [];

  const filteredMaterialOptions = form.hotelId
    ? allMaterials
        .filter(material => material.hotel_id === parseInt(form.hotelId))
        .map(material => ({
          value: material.id,
          label: material.name,
        }))
    : [];

  const renderDateInput = () => (
    <View>
      <Text style={styles.label}>Request Date</Text>
      <TouchableOpacity
        style={[styles.dateInputContainer, errors.date && styles.inputError]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateInput}>{form.date || 'Select Date'}</Text>
        <Ionicons
          name="calendar-outline"
          size={22}
          color="#1c2f87"
          style={styles.calendarIcon}
        />
      </TouchableOpacity>
      {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );

  const renderFooter = () => {
    if (!loading || !hasMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#1c2f87" />
        <Text style={styles.loadingText}>Loading more items...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return <Text style={styles.emptyText}>No material requests found.</Text>;
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>List of Material</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={24} color="#1c2f87" />
            {Object.values(filters).some(val => val !== '') && (
              <View style={styles.filterBadge} />
            )}
          </TouchableOpacity>
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
            onPress={() => {
              setForm({
                id: null,
                materialName: '',
                quantity: '',
                unit: '',
                description: '',
                hotelId: '',
                status: '',
                date: new Date().toISOString().split('T')[0],
              });
              setErrors({}); // Clear errors when adding new
              setModalVisible(true);
            }}
          >
            <Icon name="add" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Materials</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1c2f87" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalContainer}>
              <DropdownField
                label="Filter by Hotel"
                placeholder="Select hotel"
                value={filters.hotel_id} // Use hotel_id as the value
                onSelect={item => {
                  handleFilterChange('hotel_id', item.value);
                  handleFilterChange('hotel_name', item.label);
                }}
                options={hotelOptions}
                disabled={hotelsLoading}
              />

              <DropdownField
                label="Filter by Status"
                placeholder="Select status"
                value={filters.status}
                onSelect={item => handleFilterChange('status', item.value)}
                options={[
                  { label: 'Pending', value: 'pending' },
                  { label: 'Completed', value: 'completed' },
                  // { label: 'Rejected', value: 'rejected' },
                ]}
              />

              <TouchableOpacity
                onPress={() => setShowFromDatePicker(true)}
                style={styles.dateInputContainer}
              >
                <Text style={styles.dateInput}>
                  {filters.from_date || 'From Date'}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={22}
                  color="#1c2f87"
                  style={styles.calendarIcon}
                />
              </TouchableOpacity>
              {showFromDatePicker && (
                <DateTimePicker
                  value={
                    filters.from_date ? new Date(filters.from_date) : new Date()
                  }
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowFromDatePicker(false);
                    if (date)
                      setFilters(prev => ({
                        ...prev,
                        from_date: date.toISOString().split('T')[0],
                      }));
                  }}
                />
              )}

              <TouchableOpacity
                onPress={() => setShowToDatePicker(true)}
                style={styles.dateInputContainer}
              >
                <Text style={styles.dateInput}>
                  {filters.to_date || 'To Date'}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={22}
                  color="#1c2f87"
                  style={styles.calendarIcon}
                />
              </TouchableOpacity>
              {showToDatePicker && (
                <DateTimePicker
                  value={
                    filters.to_date ? new Date(filters.to_date) : new Date()
                  }
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowToDatePicker(false);
                    if (date)
                      setFilters(prev => ({
                        ...prev,
                        to_date: date.toISOString().split('T')[0],
                      }));
                  }}
                />
              )}

              <View style={styles.filterModalActions}>
                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={clearFilters}
                >
                  <Text style={styles.clearFiltersText}>Clear Filters</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyFiltersButton}
                  onPress={applyFilters}
                >
                  <Text style={styles.applyFiltersText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {viewMode === 'list' ? (
        <FlatList
          data={materials}
          keyExtractor={item => item?.id?.toString()}
          renderItem={renderMaterialItem}
          contentContainerStyle={[
            styles.materialList,
            { paddingBottom: insets.bottom }, // Add paddingBottom using insets
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#1c2f87']}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
      ) : (
        <TableView
          data={materials}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onEndReached={handleLoadMore}
          loading={loading}
          hasMore={hasMore}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setErrors({}); // Clear errors when closing modal
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {form.id ? 'Edit Request' : 'Add Request'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setErrors({}); // Clear errors when closing modal
                }}
              >
                <Ionicons name="close" size={24} color="#1c2f87" />
              </TouchableOpacity>
            </View>
            <ScrollView
              contentContainerStyle={styles.modalContainer}
              showsVerticalScrollIndicator={false}
            >
              <DropdownField
                label="Hotel"
                placeholder="Select hotel"
                value={form.hotelId}
                onSelect={item => {
                  handleChange('hotelId', item.value);
                  handleChange('materialId', '');
                  handleChange('materialName', '');
                }}
                options={hotelOptions}
                disabled={hotelsLoading}
                error={errors.hotelId}
              />

              <DropdownField
                label="Material"
                placeholder="Select material"
                value={form.materialId}
                onSelect={item => {
                  handleChange('materialId', item.value);
                  handleChange('materialName', item.label);
                  const selectedMaterial = allMaterials?.find(
                    mat => mat.id === item.value,
                  );
                  handleChange('unit', selectedMaterial?.unit || '');
                }}
                options={allMaterials?.map(material => ({
                  value: material.id,
                  label: material.name,
                }))}
                disabled={allMaterials.length === 0}
                error={errors.materialId}
              />

              <InputField
                label="Quantity"
                placeholder="Enter quantity"
                value={form.quantity}
                onChangeText={val => handleChange('quantity', val)}
                keyboardType="numeric"
                error={errors.quantity}
              />

              <InputField
                label="Unit"
                placeholder="Unit"
                value={form.unit}
                editable={false}
              />

              {form.id && (
                <DropdownField
                  label="Status"
                  placeholder="Select status"
                  value={form.status}
                  onSelect={item => handleChange('status', item.value)}
                  options={[
                    { label: 'Pending', value: 'pending' },
                    { label: 'Completed', value: 'completed' },
                  ]}
                  error={errors.status}
                />
              )}

              {renderDateInput()}

              <DropdownField
                label="Remark"
                placeholder="Select remark"
                value={form.remark}
                onSelect={item => handleChange('remark', item.value)}
                options={[
                  { label: 'InStock', value: 'InStock' },
                  { label: 'Used', value: 'Used' },
                ]}
                error={errors.remark}
              />

              <InputField
                label="Description"
                placeholder="Enter description"
                value={form.description}
                onChangeText={val => handleChange('description', val)}
                multiline
              />

              <View style={styles.formBtnRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setModalVisible(false);
                    setErrors({}); // Clear errors when canceling
                  }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <DeleteAlert
        visible={isDeleteAlertVisible}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title="Delete Material Request"
        message="Are you sure you want to delete this material request?"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
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
  materialList: {
    padding: 16,
    paddingBottom: 60,
  },
  materialItem: {
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#1c2f87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c2f87',
  },
  materialDetails: {
    fontSize: 14,
    color: '#555',
    marginVertical: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginTop: 4,
    marginLeft: 4,
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
    width: '90%',
    maxHeight: '87%',
    padding: 18,
    elevation: 8,
  },
  filterModalContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    width: '90%',
    maxHeight: '70%',
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
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    fontSize: 11,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    marginRight: 12,
    padding: 4,
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
  viewToggleBtn: {
    marginRight: 12,
    padding: 4,
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
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontFamily: 'Poppins-Regular',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginVertical: 6,
    paddingRight: 12,
  },
  dateInput: {
    flex: 1,
    padding: 12,
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#1c2f87',
  },
  calendarIcon: {
    marginLeft: 8,
  },
  loadingFooter: {
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#1c2f87',
    fontSize: 14,
  },
  filterModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  clearFiltersButton: {
    backgroundColor: '#e9ecef',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  clearFiltersText: {
    color: '#1c2f87',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  applyFiltersButton: {
    backgroundColor: '#1c2f87',
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  applyFiltersText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  label: {
    fontSize: 14,
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginTop: 4,
    marginLeft: 4,
  },
});

export default MaterialRequestScreen;
