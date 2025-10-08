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
import { Calendar } from 'react-native-calendars';
import CalendarModal from '../../components/CalendarModal';
import { TouchableWithoutFeedback, Keyboard } from 'react-native';

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
  selectionMode,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
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
            {/* Select All */}
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
                    data.every(item => selectedIds.has(item.id))
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
            renderItem={({ item }) => {
              // Check if remark is "Used" and status is "pending"
              const displayStatus =
                item.remark === 'Used' && item.status === 'pending'
                  ? '-'
                  : item.status;

              return (
                <View style={styles.tableRow}>
                  {/* Row checkbox */}
                  <TouchableOpacity
                    onPress={() => selectionMode && onToggleSelect(item.id)}
                    style={{ width: 50, alignItems: 'center' }}
                    disabled={!selectionMode}
                  >
                    {selectionMode ? (
                      <Ionicons
                        name={
                          selectedIds.has(item.id)
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
                  <View
                    style={[
                      styles.tableCell,
                      {
                        width: 100,
                        alignItems: 'center',
                        justifyContent: 'center',
                      },
                    ]}
                  >
                    {displayStatus === '-' ? (
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: 'black',
                            alignItems: 'center',
                            justifyContent: 'center',
                          },
                        ]}
                      >
                        {displayStatus}
                      </Text>
                    ) : (
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              displayStatus === 'pending'
                                ? '#ffc107'
                                : displayStatus === 'completed'
                                ? '#28a745'
                                : '#6c757d',
                          },
                        ]}
                      >
                        <Text style={styles.statusText}>{displayStatus}</Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.tableActions, { width: 100 }]}>
                    <TouchableOpacity onPress={() => onEdit(item)}>
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color="#1c2f87"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete(item.id)}>
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#fe8c06"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
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
  // const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('form'); // "form" or "filter"
  const [datePickerField, setDatePickerField] = useState('from'); // "from" or "to" when filter
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);
  const [calendarMode, setCalendarMode] = useState('from');

  const openCalendarModal = mode => {
    setCalendarMode(mode);
    setShowCalendarModal(true);
  };

  const openFromCalendar = () => {
    if (!filters.from_date) {
      const today = new Date().toISOString().split('T')[0];
      setFilters(prev => ({ ...prev, from_date: today }));
    }
    setShowFromCalendar(true);
  };
  const openToCalendar = () => {
    if (!filters.to_date) {
      const today = new Date().toISOString().split('T')[0];
      setFilters(prev => ({ ...prev, to_date: today }));
    }
    setShowToCalendar(true);
  };

  const closeFromCalendar = () => setShowFromCalendar(false);
  const closeToCalendar = () => setShowToCalendar(false);

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
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

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
        remark: filters.remark,
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
    if (selectionMode) {
      toggleSelect(id);
      return;
    }
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

  const confirmBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const idsArray = Array.from(selectedIds);
    try {
      await dispatch(deleteMaterial(idsArray)).unwrap();
      Toast.show({ type: 'success', text1: 'Deleted successfully' });
      exitSelectionMode();
      dispatch(resetMaterials());
      dispatch(fetchAllMaterials({ page: 1, per_page: perPage }));
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete requests',
      });
    } finally {
      setShowBulkDeleteModal(false);
    }
  };

  const cancelBulkDelete = () => setShowBulkDeleteModal(false);

  const enterSelectionMode = (initialId = null) => {
    setSelectionMode(true);
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (initialId != null) next.add(initialId);
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
    const allIds = materials.map(m => m.id);
    const allSelected =
      allIds.length > 0 && allIds.every(id => selectedIds.has(id));
    setSelectedIds(allSelected ? new Set() : new Set(allIds));
  };

  const renderMaterialItem = ({ item }) => {
    const displayStatus =
      item.remark === 'Used' && item.status === 'pending' ? '-' : item.status;
    return (
      <TouchableOpacity
        style={styles.materialItem}
        activeOpacity={0.9}
        onLongPress={() => enterSelectionMode(item.id)}
        onPress={() => {
          if (selectionMode) toggleSelect(item.id);
        }}
      >
        {selectionMode && (
          <View style={{ marginRight: 8 }}>
            <Ionicons
              name={
                selectedIds.has(item.id) ? 'checkbox-outline' : 'square-outline'
              }
              size={22}
              color="#1c2f87"
            />
          </View>
        )}
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
          <View style={styles.statusContainer}>
            {displayStatus === '-' ? (
              <Text
                style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}
              >
                {displayStatus}
              </Text>
            ) : (
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
                <Text style={styles.statusText}>{displayStatus}</Text>
              </View>
            )}
          </View>
        </View>
        {!selectionMode && (
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={() => handleEdit(item)}>
              <Ionicons name="create-outline" size={22} color="#1c2f87" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Ionicons name="trash-outline" size={22} color="#fe8c06" />
            </TouchableOpacity>
          </View>
        )}
        {/* {selectionMode ? (
        <Ionicons
          name={selectedIds.has(item.id) ? 'checkbox-outline' : 'square-outline'}
          size={22}
          color="#1c2f87"
        />
      ) : (
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => handleEdit(item)}>
            <Ionicons name="create-outline" size={22} color="#1c2f87" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={22} color="#fe8c06" />
          </TouchableOpacity>
        </View>
      )} */}
      </TouchableOpacity>
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
      {/* <Text style={styles.label}>Request Date</Text> */}
      <TouchableOpacity
        style={[styles.dateInputContainer, errors.date && styles.inputError]}
        onPress={() => {
          if (!form.date) {
            const today = new Date().toISOString().split('T')[0];
            setForm(prev => ({ ...prev, date: today }));
          }
          setShowDatePicker(true);
        }}
      >
        <Text style={styles.dateInput}>
          {form.date || 'Select Requested Date'}
        </Text>
        <Ionicons
          name="calendar-outline"
          size={22}
          color="#1c2f87"
          style={styles.calendarIcon}
        />
      </TouchableOpacity>
      {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
      <CalendarModal
        visible={showDatePicker}
        selectedDate={form.date}
        onSelectDate={date => {
          setForm(prev => ({ ...prev, date }));
          if (errors.date) setErrors(prev => ({ ...prev, date: '' }));
          setShowDatePicker(false);
        }}
        onClose={() => setShowDatePicker(false)}
      />
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
                  materials.length > 0 &&
                  materials.every(m => selectedIds.has(m.id))
                    ? 'checkbox-outline'
                    : 'square-outline'
                }
                size={24}
                color="#1c2f87"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginRight: 12, padding: 4 }}
              // onPress={() => setShowBulkDeleteModal(true)}
              onPress={() => {
                if (selectedIds.size > 0) {
                  setShowBulkDeleteModal(true);
                } else {
                  Toast.show({
                    type: 'error',
                    text1: 'No material request selected',
                    // text2: 'Please select at least one material request to delete.',
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
              style={[styles.viewToggleBtn, { marginRight: 8 }]}
              onPress={() => enterSelectionMode()}
            >
              <Ionicons name="checkbox-outline" size={24} color="#1c2f87" />
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
                setErrors({});
                setModalVisible(true);
              }}
            >
              <Icon name="add" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Filter modal */}
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
                value={filters.hotel_id}
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
                ]}
              />
              <DropdownField
                label="Filter by Remark"
                placeholder="Select remark"
                value={filters.remark}
                onSelect={item => handleFilterChange('remark', item.value)}
                options={[
                  { label: 'InStock', value: 'InStock' },
                  { label: 'Used', value: 'Used' },
                ]}
              />

              {/* From Date */}
              <TouchableOpacity
                onPress={openFromCalendar}
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

              {/* To Date */}
              <TouchableOpacity
                onPress={openToCalendar}
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
              <CalendarModal
                visible={showFromCalendar}
                selectedDate={filters.from_date}
                onSelectDate={date =>
                  setFilters(prev => ({ ...prev, from_date: date }))
                }
                onClose={() => setShowFromCalendar(false)}
              />

              <CalendarModal
                visible={showToCalendar}
                selectedDate={filters.to_date}
                onSelectDate={date =>
                  setFilters(prev => ({ ...prev, to_date: date }))
                }
                onClose={() => setShowToCalendar(false)}
              />

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

          {/* Calendar Modal */}
          {showCalendarModal && (
            <Modal
              visible={showCalendarModal}
              transparent
              animationType="slide"
              onRequestClose={() => setShowCalendarModal(false)}
            >
              <View style={styles.modalContainers}>
                <View style={styles.calendarWrapper}>
                  <Calendar
                    onDayPress={day => {
                      const selectedDate = day.dateString;
                      if (calendarMode === 'from') {
                        setFilters(prev => ({
                          ...prev,
                          from_date: selectedDate,
                        }));
                      } else {
                        setFilters(prev => ({
                          ...prev,
                          to_date: selectedDate,
                        }));
                      }
                      setShowCalendarModal(false);
                    }}
                    markedDates={{
                      ...(filters.from_date
                        ? {
                            [filters.from_date]: {
                              selected: true,
                              selectedColor: '#1c2f87',
                            },
                          }
                        : {}),
                      ...(filters.to_date
                        ? {
                            [filters.to_date]: {
                              selected: true,
                              selectedColor: '#1c2f87',
                            },
                          }
                        : {}),
                    }}
                    theme={{
                      todayTextColor: '#1c2f87',
                      selectedDayBackgroundColor: '#1c2f87',
                      arrowColor: '#1c2f87',
                    }}
                  />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowCalendarModal(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
        </View>
      </Modal>
      {viewMode === 'list' ? (
        <FlatList
          data={materials}
          keyExtractor={item => item?.id?.toString()}
          renderItem={renderMaterialItem}
          contentContainerStyle={[
            styles.materialList,
            // { paddingBottom: insets.bottom }, // Add paddingBottom using insets
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
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={() => {
            if (!selectionMode) enterSelectionMode();
            toggleSelectAll();
          }}
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
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
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
                  // label="Quantity"
                  placeholder="Enter quantity"
                  value={form.quantity}
                  onChangeText={val => handleChange('quantity', val)}
                  keyboardType="numeric"
                  error={errors.quantity}
                />

                <InputField
                  // label="Unit"
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
                  // label="Description"
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
        </TouchableWithoutFeedback>
      </Modal>
      <DeleteAlert
        visible={isDeleteAlertVisible}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title="Delete Material Request"
        message="Are you sure you want to delete this material request?"
      />
      <DeleteAlert
        visible={showBulkDeleteModal}
        onConfirm={confirmBulkDelete}
        onCancel={cancelBulkDelete}
        title="Delete Requests"
        message={`Are you sure you want to delete ${
          selectedIds.size
        } selected request${selectedIds.size === 1 ? '' : 's'}?`}
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
    // marginBottom: 20,
    // backgroundColor: '#f5f5f5',
    // padding: 16,
    // borderRadius: 10,
    // shadowColor: '#1c2f87',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
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
  modalContainers: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  calendarWrapper: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 36,
    elevation: 5,
  },
  closeButton: {
    marginTop: 10,
    alignSelf: 'center',
    padding: 10,
    backgroundColor: '#1c2f87',
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default MaterialRequestScreen;
