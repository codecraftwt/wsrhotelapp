import React, { useEffect, useState } from 'react';
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
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DropdownField from '../../components/DropdownField';
import { InputField } from '../../components/InputField';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import {
  addPaymentLedger,
  fetchPaymentLedger,
  fetchPlatformModes,
  editPaymentLedger,
  deletePaymentLedger,
  resetPaymentLedger,
  fetchPlatformBalance,
} from '../../redux/slices/paymentLedgerSlice';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { fetchHotels } from '../../redux/slices/hotelSlice';
import {
  showValidationError,
  showSaveSuccess,
  showUpdateSuccess,
  showSaveError,
} from '../../utils/toastUtils';
import DeleteAlert from '../../components/DeleteAlert';
import SearchComponent from '../../components/SearchComponent';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Colors } from '../../assets/globleStyles/colors';

const VALIDATION_RULES = {
  date: { required: true },
  hotel_id: { required: true },
  platform: { required: true },
  mode: { required: true },
  // description: { required: true, minLength: 2, maxLength: 200 },
  amount: { required: true, pattern: /^\d+(\.\d{1,2})?$/ },
  relatedPlatform: { required: true }, // Will be conditionally validated
};

const TableView = ({
  data,
  onEdit,
  onDelete,
  onEndReached,
  onEndReachedThreshold,
  ListFooterComponent,
  selectionMode,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}) => (
  <View style={styles.tableContainer}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                color={Colors.white}
              />
            ) : (
              <Text style={{ color: 'transparent' }}>#</Text>
            )}
          </TouchableOpacity>
          <Text style={[styles.tableHeaderCell, { width: 150 }]}>Date</Text>
          <Text style={[styles.tableHeaderCell, { width: 150 }]}>Hotels</Text>
          <Text style={[styles.tableHeaderCell, { width: 150 }]}>Platform</Text>
          <Text style={[styles.tableHeaderCell, { width: 150 }]}>
            Related Platform
          </Text>
          <Text style={[styles.tableHeaderCell, { width: 150 }]}>Mode</Text>
          <Text style={[styles.tableHeaderCell, { width: 150 }]}>Credit</Text>
          <Text style={[styles.tableHeaderCell, { width: 150 }]}>Debit</Text>
          <Text style={[styles.tableHeaderCell, { width: 150 }]}>Balance</Text>
          <Text style={[styles.tableHeaderCell, { width: 150 }]}>Actions</Text>
        </View>
        <FlatList
          data={data}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.tableRow} key={item.id}>
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
                    color={Colors.darkBlue}
                  />
                ) : (
                  <Text style={{ color: 'transparent' }}>#</Text>
                )}
              </TouchableOpacity>
              <Text style={[styles.tableCell, { width: 150 }]}>
                {item.date}
              </Text>
              <Text style={[styles.tableCell, { width: 150 }]}>
                {item?.hotel_name ? item.hotel_name : 'N/A'}
              </Text>
              <Text style={[styles.tableCell, { width: 150 }]}>
                {item?.platform_name}
              </Text>
              <View
                style={[
                  styles.tableCell,
                  {
                    width: 150,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  },
                ]}
              >
                {item.transfer_name && item.mode === 'Transfer' && (
                  <View
                    style={[styles.arrowIcon, { backgroundColor: '#0288D1' }]}
                  >
                    <MaterialIcons
                      name="arrow-forward"
                      size={16}
                      color={Colors.white}
                    />
                  </View>
                )}
                {item.transfer_name && item.mode === 'Credit' && (
                  <View
                    style={[styles.arrowIcon, { backgroundColor: '#9C27B0' }]}
                  >
                    <MaterialIcons
                      name="arrow-back"
                      size={16}
                      color={Colors.white}
                    />
                  </View>
                )}
                <Text style={{ flex: 1 }}>{item.transfer_name}</Text>
              </View>
              <Text style={[styles.tableCell, { width: 150 }]}>
                {item.mode}
              </Text>
              <Text
                style={[styles.tableCell, styles.creditAmount, { width: 150 }]}
              >
                {item?.credit === '0.00' || Number(item?.credit) === 0
                  ? '-'
                  : item?.credit}
              </Text>
              <Text
                style={[styles.tableCell, styles.debitAmount, { width: 150 }]}
              >
                {item?.debit === '0.00' || Number(item?.debit) === 0
                  ? '-'
                  : item?.debit}
              </Text>
              <Text style={[styles.tableCell, { width: 150 }]}>
                {item.balance}
              </Text>
              <View style={[styles.tableActions, { width: 150 }]}>
                <TouchableOpacity onPress={() => onEdit(item)}>
                  <Ionicons
                    name="create-outline"
                    size={20}
                    color={Colors.darkBlue}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(item.id)}>
                  <Ionicons name="trash-outline" size={20} color={Colors.orange} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          onEndReached={onEndReached}
          onEndReachedThreshold={onEndReachedThreshold}
          ListFooterComponent={ListFooterComponent}
        />
      </View>
    </ScrollView>
  </View>
);

export default function PaymentLedgerScreen() {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const {
    paymentLedgers,
    platformBalance,
    totals,
    loading,
    error,
    page,
    hasMore,
  } = useSelector(state => state.paymentLedger);
  const platformModes = useSelector(state => state.paymentLedger.platformModes);
  const { hotels } = useSelector(state => state.hotel);
  const [relatedPlatform, setRelatedPlatform] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Filter states
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterMode, setFilterMode] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [filterHotelId, setFilterHotelId] = useState('');
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  const filters = {
    platform: filterPlatform,
    mode: filterMode,
    fromDate: filterFromDate,
    toDate: filterToDate,
    hotelId: filterHotelId,
  };

  // Edit mode states
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // Pagination: Load more items when end is reached
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const perPage = 10;
  const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && !loading) {
      setIsLoadingMore(true);
      dispatch(
        fetchPaymentLedger({
          page: page + 1,
          per_page: perPage,
          mode: filterMode,
          platform_name: filterPlatform,
          from_date: filterFromDate,
          to_date: filterToDate,
          hotel_id: filterHotelId,
        }),
      ).finally(() => setIsLoadingMore(false));
    }
  };

  useEffect(() => {
    dispatch(resetPaymentLedger());
    dispatch(fetchPaymentLedger({ page: 1, per_page: perPage }));
    dispatch(fetchPlatformModes());
    dispatch(fetchHotels());
  }, [dispatch]);

  const filteredPayments = paymentLedgers.filter(
    payment =>
      payment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.platform?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const [form, setForm] = useState({
    date: '',
    hotel_id: '',
    platform: '',
    mode: '',
    description: '',
    amount: 0,
  });
  const [errors, setErrors] = useState({});
  console.log(totals?.total_credit);
  useEffect(() => {
    dispatch(fetchPlatformModes()); // Fetch platform modes when the component mounts
  }, [dispatch]);

  // Inside PaymentLedgerScreen
  useEffect(() => {
    if (form.mode === 'Transfer' && form.platform) {
      // Dispatch fetchBalance when the mode is Transfer
      dispatch(fetchPlatformBalance(form.platform));
    }
  }, [form.mode, form.platform, dispatch]);

  const handleChange = (field, value) => {
    setForm(prevForm => ({
      ...prevForm,
      [field]: field === 'amount' ? Number(value) || 0 : value, // Ensure amount is a number
    }));
    if (field === 'relatedPlatform') {
      setRelatedPlatform(value); // Set the related platform for "Transfer"
    }
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear relatedPlatform error when mode changes from 'Transfer' to something else
    if (field === 'mode' && value !== 'Transfer' && errors.relatedPlatform) {
      setErrors(prev => ({ ...prev, relatedPlatform: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(VALIDATION_RULES).forEach(field => {
      const value = field === 'relatedPlatform' ? relatedPlatform : form[field];
      const rules = VALIDATION_RULES[field];

      // Skip validation for relatedPlatform if mode is not 'Transfer'
      if (field === 'relatedPlatform' && form.mode !== 'Transfer') {
        return;
      }

      // For relatedPlatform, only validate if mode is 'Transfer'
      if (field === 'relatedPlatform' && form.mode === 'Transfer') {
        if (!value || String(value).trim() === '') {
          newErrors[field] = 'Please select a related platform';
          return;
        }
      }

      if (rules.required && (!value || String(value).trim() === '')) {
        // Custom error messages for dropdown fields
        if (field === 'hotel_id') {
          newErrors[field] = 'Please select a hotel';
        } else if (field === 'platform') {
          newErrors[field] = 'Please select a platform';
        } else if (field === 'mode') {
          newErrors[field] = 'Please select a mode';
        } else if (field === 'date') {
          newErrors[field] = 'Please select a date';
        } else {
          newErrors[field] = `${field
            .replace('_', ' ')
            .replace(/\b\w/g, l => l.toUpperCase())} is required`;
        }
        return;
      }

      if (value && String(value).trim() !== '') {
        if (rules.minLength && value.length < rules.minLength) {
          newErrors[field] = `${field
            .replace('_', ' ')
            .replace(/\b\w/g, l => l.toUpperCase())} must be at least ${
            rules.minLength
          } characters`;
        } else if (rules.maxLength && value.length > rules.maxLength) {
          newErrors[field] = `${field
            .replace('_', ' ')
            .replace(/\b\w/g, l => l.toUpperCase())} must be less than ${
            rules.maxLength
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

  const handleEdit = item => {
    setEditMode(true);
    setEditId(item.id);
    setForm({
      date: item.date,
      hotel_id: item.hotel_id || '',
      platform: item.platform_id || '',
      mode: item.mode,
      description: item.description,
      amount: item.credit !== '0.00' ? item.credit : item.debit,
    });
    setRelatedPlatform(item.transfer_id || '');
    setErrors({}); // Clear errors when editing
    setModalVisible(true);
  };

  const handleDelete = id => {
    if (selectionMode) {
      toggleSelect(id);
      return;
    }
    setPaymentToDelete(id);
    setIsDeleteAlertVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deletePaymentLedger(paymentToDelete))
        .unwrap()
        .then(() => {
          Toast.show({
            type: 'success',
            text1: 'Deleted successfully',
          });
          // Reload data with current filters and pagination
          dispatch(
            fetchPaymentLedger({
              page: 1, // Always reset to page 1 after delete
              per_page: perPage * page, // Load all items up to current page
              mode: filterMode,
              platform_name: filterPlatform,
              from_date: filterFromDate,
              to_date: filterToDate,
              hotel_id: filterHotelId,
            }),
          );
          setIsDeleteAlertVisible(false);
          setPaymentToDelete(null);
        });
    } catch (error) {
      Alert.alert('Error', 'Failed to delete payment');
      setIsDeleteAlertVisible(false);
      setPaymentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteAlertVisible(false);
    setPaymentToDelete(null);
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const idsArray = Array.from(selectedIds);
    try {
      await dispatch(deletePaymentLedger(idsArray)).unwrap();
      Toast.show({ type: 'success', text1: 'Deleted successfully' });
      exitSelectionMode();
      dispatch(resetPaymentLedger());
      dispatch(fetchPaymentLedger({ page: 1, per_page: perPage }));
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete payments',
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
    const allIds = filteredPayments.map(p => p.id);
    const allSelected =
      allIds.length > 0 && allIds.every(id => selectedIds.has(id));
    setSelectedIds(allSelected ? new Set() : new Set(allIds));
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      // showValidationError();
      return;
    }
    // Prepare payment data to be added
    const paymentData = {
      date: form.date,
      hotel_id: form.hotel_id,
      platform_id: form.platform,
      mode: form.mode,
      description: form.description,
      amount: form.amount,
      transfer_id: form.mode === 'Transfer' ? relatedPlatform : null, // Add related platform if mode is "Transfer"
    };

    // Dispatch addPaymentLedger action
    if (editMode) {
      dispatch(editPaymentLedger({ id: editId, paymentData }))
        .unwrap()
        .then(() => {
          // Clear the form and close modal on success
          setForm({
            date: '',
            hotel_id: '',
            platform: '',
            mode: '',
            description: '',
            amount: 0,
          });
          setEditMode(false);
          setEditId(null);
          setModalVisible(false);
          dispatch(
            fetchPaymentLedger({
              page: 1,
              per_page: perPage * page, // Load all items up to current page
              mode: filterMode,
              platform_name: filterPlatform,
              from_date: filterFromDate,
              to_date: filterToDate,
              hotel_id: filterHotelId,
            }),
          );
          Toast.show({
            type: 'success',
            text1: 'Updated successfully',
          });
        })
        .catch(error => {
          console.error('Failed to edit payment ledger: ', error);
          showSaveError('Payment');
        });
    } else {
      dispatch(addPaymentLedger(paymentData))
        .unwrap()
        .then(() => {
          // Clear the form and close modal on success
          setForm({
            date: '',
            hotel_id: '',
            platform: '',
            mode: '',
            description: '',
            amount: 0,
          });
          setModalVisible(false);
          dispatch(
            fetchPaymentLedger({
              page: 1,
              per_page: perPage * page, // Load all items up to current page
              mode: filterMode,
              platform_name: filterPlatform,
              from_date: filterFromDate,
              to_date: filterToDate,
              hotel_id: filterHotelId,
            }),
          );
          Toast.show({
            type: 'success',
            text1: 'added successfully',
          });
        })
        .catch(error => {
          console.error('Failed to add payment ledger: ', error);
          showSaveError('Payment');
        });
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0];
      handleChange('date', formatted);
    }
  };

  // Filter handler
  const handleApplyFilter = () => {
    dispatch(resetPaymentLedger());
    dispatch(
      fetchPaymentLedger({
        page: 1,
        per_page: perPage,
        mode: filterMode,
        platform_name: filterPlatform,
        from_date: filterFromDate,
        to_date: filterToDate,
        hotel_id: filterHotelId,
      }),
    );
  };

  // Date pickers for filter
  const handleFromDateChange = (event, selectedDate) => {
    setShowFromDatePicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0];
      setFilterFromDate(formatted);
    }
  };
  const handleToDateChange = (event, selectedDate) => {
    setShowToDatePicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0];
      setFilterToDate(formatted);
    }
  };

  // Clear filter handler
  const handleClearFilter = () => {
    setFilterPlatform('');
    setFilterMode('');
    setFilterFromDate('');
    setFilterToDate('');
    setFilterHotelId('');
    setFilterModalVisible(false);
    dispatch(resetPaymentLedger());
    dispatch(fetchPaymentLedger());
  };

  const renderDateInput = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const effectiveDate = form.date || todayStr; // default select today in calendar
    return (
      <View style={styles.inputGroup}>
        {/* <Text style={styles.label}>Expense Date</Text> */}
        <TouchableOpacity
          style={[
            styles.input,
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
            errors.date && styles.inputError,
          ]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={{ color: form.date ? Colors.darkBlue : '#888' }}>
            {form.date ? form.date : 'Select Date'}
          </Text>
          <Ionicons name="calendar-outline" size={20} color={Colors.orange} />
        </TouchableOpacity>

        {showDatePicker && (
          <Modal
            visible={showDatePicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.modalContainers}>
              <View style={styles.calendarWrapper}>
                <Calendar
                  initialDate={effectiveDate}
                  onDayPress={day => {
                    handleChange('date', day.dateString); // YYYY-MM-DD
                    setShowDatePicker(false);
                  }}
                  markedDates={{
                    [effectiveDate]: {
                      selected: true,
                      selectedColor: Colors.darkBlue,
                    },
                  }}
                  theme={{
                    todayTextColor: Colors.darkBlue,
                    selectedDayBackgroundColor: Colors.darkBlue,
                    arrowColor: Colors.darkBlue,
                  }}
                />

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
      </View>
    );
  };
  // Get the platform name from the platformModes based on the selected platform ID
  const selectedPlatform = platformModes.find(
    platform => platform.id === form.platform,
  );
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
                  filteredPayments.length > 0 &&
                  filteredPayments.every(p => selectedIds.has(p.id))
                    ? 'checkbox-outline'
                    : 'square-outline'
                }
                size={24}
                color={Colors.darkBlue}
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
                    text1: 'No payment entries selected',
                    // text2: 'Please select at least one material request to delete.',
                  });
                }
              }}
            >
              <Ionicons name="trash-outline" size={24} color={Colors.orange} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={exitSelectionMode}>
              <Ionicons name="close" size={22} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Payment Ledger</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setFilterModalVisible(true)}
            >
              <Ionicons name="filter" size={24} color={Colors.darkBlue} />
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
                color={Colors.darkBlue}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewToggleBtn, { marginRight: 8 }]}
              onPress={() => enterSelectionMode()}
            >
              <Ionicons name="checkbox-outline" size={24} color={Colors.darkBlue}/>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => {
                setEditMode(false);
                setEditId(null);
                setForm({
                  date: '',
                  hotel_id: '',
                  platform: '',
                  mode: '',
                  description: '',
                  amount: 0,
                });
                setRelatedPlatform('');
                setErrors({});
                setModalVisible(true);
              }}
            >
              <Ionicons name="add" size={26} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Search Bar */}
      <SearchComponent
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by description or platform"
        resultsCount={filteredPayments.length}
        showResults={true}
      />

      {viewMode === 'list' ? (
        <FlatList
          data={filteredPayments}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.9}
              onLongPress={() => enterSelectionMode(item.id)}
              onPress={() => {
                if (selectionMode) toggleSelect(item.id);
              }}
            >
              {selectionMode && (
                <View style={{ marginBottom: 8 }}>
                  <Ionicons
                    name={
                      selectedIds.has(item.id)
                        ? 'checkbox-outline'
                        : 'square-outline'
                    }
                    size={22}
                    color={Colors.darkBlue}
                  />
                </View>
              )}
              <View style={styles.materialInfo}>
                {/* Header: Date and Mode Badge */}
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.dateText}>{item.date}</Text>
                  <View
                    style={[
                      styles.modeBadge,
                      item.mode === 'Credit'
                        ? styles.modeCredit
                        : item.mode === 'Transfer'
                        ? styles.modeTransfer
                        : styles.modeDefault,
                    ]}
                  >
                    <Text style={styles.modeBadgeText}>{item.mode}</Text>
                  </View>
                </View>

                {/* Platforms */}
                <View style={styles.platformRow}>
                  <View style={[styles.chip, styles.platformChip]}>
                    <MaterialIcons name="layers" size={16} color={Colors.darkBlue} />
                    <Text style={styles.chipText}>{item.platform_name}</Text>
                  </View>
                  {!!item.transfer_name && (
                    <View style={[styles.chip, styles.relatedChip]}>
                      <MaterialIcons
                        name="swap-horiz"
                        size={16}
                        color="#6f42c1"
                      />
                      <Text style={styles.chipText}>{item.transfer_name}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.divider} />

                {/* Amounts */}
                <View style={styles.amountRow}>
                  <View style={[styles.amountPill, styles.creditPill]}>
                    <MaterialIcons
                      name="arrow-downward"
                      size={16}
                      color={Colors.green}
                    />
                    <Text style={styles.amountLabel}>Credit</Text>
                    <Text style={[styles.amountValue, styles.paymentCredit]}>
                      {item?.credit === '0.00' || Number(item?.credit) === 0
                        ? '—'
                        : item?.credit}
                    </Text>
                  </View>
                  <View style={[styles.amountPill, styles.debitPill]}>
                    <MaterialIcons
                      name="arrow-upward"
                      size={16}
                      color={Colors.red}
                    />
                    <Text style={styles.amountLabel}>Debit</Text>
                    <Text style={[styles.amountValue, styles.paymentDebit]}>
                      {item?.debit === '0.00' || Number(item?.debit) === 0
                        ? '—'
                        : item?.debit}
                    </Text>
                  </View>
                </View>

                {/* Balance */}
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceLabel}>Balance</Text>
                  <View style={styles.balancePill}>
                    <MaterialIcons
                      name="account-balance-wallet"
                      size={16}
                      color={Colors.darkBlue}
                    />
                    <Text style={styles.balanceValue}>{item.balance}</Text>
                  </View>
                </View>
              </View>
              {!selectionMode && (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    marginTop: 10,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => handleEdit(item)}
                    style={{ marginRight: 16 }}
                  >
                    <Ionicons name="create-outline" size={20} color={Colors.darkBlue} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash-outline" size={20} color={Colors.orange} />
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore && hasMore ? (
              <View style={{ padding: 16, alignItems: 'center' }}>
                <Text>Loading more...</Text>
              </View>
            ) : null
          }
        />
      ) : (
        <TableView
          data={filteredPayments}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore && hasMore ? (
              <View style={{ padding: 16, alignItems: 'center' }}>
                <Text>Loading more...</Text>
              </View>
            ) : null
          }
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={() => {
            if (!selectionMode) enterSelectionMode();
            toggleSelectAll();
          }}
        />
      )}
      <View style={styles.totalsContainer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Credit:</Text>
          <Text style={[styles.totalValue, styles.creditAmount]}>
            ₹{totals?.total_credit}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Debit:</Text>
          <Text style={[styles.totalValue, styles.debitAmount]}>
            ₹{totals?.total_debit}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Balance:</Text>
          <Text style={[styles.totalValue]}>₹{totals?.total_balance}</Text>
        </View>
      </View>
      {/* add/Edit modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setEditMode(false);
          setEditId(null);
          setErrors({}); // Clear errors when closing modal
        }}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editMode ? 'Edit Payment' : 'Add Payment'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    setEditMode(false);
                    setEditId(null);
                    setErrors({}); // Clear errors when closing modal
                  }}
                >
                  <Ionicons name="close" size={24} color={Colors.darkBlue} />
                </TouchableOpacity>
              </View>
              <ScrollView
                contentContainerStyle={styles.modalContainer}
                showsVerticalScrollIndicator={false}
              >
                {/* Hotel Dropdown */}
                <DropdownField
                  label="Hotel"
                  placeholder="Select hotel"
                  value={form.hotel_id}
                  onSelect={item => handleChange('hotel_id', item.value)}
                  options={hotels?.map(hotel => ({
                    label: hotel.name,
                    value: hotel.id,
                  }))}
                  error={errors.hotel_id}
                />
                {/* Platform Dropdown */}
                <DropdownField
                  label="Platform"
                  placeholder="Select platform"
                  value={form.platform}
                  onSelect={item => handleChange('platform', item.value)}
                  options={platformModes?.map(platform => ({
                    label: platform.name,
                    value: platform.id,
                  }))}
                  error={errors.platform}
                />
                {/* Mode Dropdown */}
                <DropdownField
                  label="Mode"
                  placeholder="Select mode"
                  value={form.mode}
                  onSelect={item => handleChange('mode', item.value)}
                  options={[
                    { label: 'Credit', value: 'Credit' },
                    { label: 'Transfer', value: 'Transfer' },
                  ]}
                  error={errors.mode}
                />

                {form.mode === 'Transfer' &&
                  form.platform &&
                  selectedPlatform &&
                  platformBalance !== null && (
                    <View style={styles.balanceContainer}>
                      <Text style={styles.balanceText}>
                        Current balance of {selectedPlatform.name}{' '}
                        {platformBalance}
                      </Text>
                      {/* <Text style={styles.balanceText}>Balance: {platformBalance}</Text> */}
                    </View>
                  )}
                {/* Conditionally render "Transfer To" dropdown */}
                {form.mode === 'Transfer' && (
                  <DropdownField
                    label="Transfer To"
                    placeholder="Select related platform"
                    value={relatedPlatform}
                    onSelect={item =>
                      handleChange('relatedPlatform', item.value)
                    }
                    options={platformModes?.map(platform => ({
                      label: platform.name,
                      value: platform.id,
                    }))}
                    error={errors.relatedPlatform}
                  />
                )}
                {/* Date Input */}
                {renderDateInput()}
                {/* Description Input */}
                <InputField
                  // label="Description"
                  placeholder="Enter description"
                  value={form.description}
                  onChangeText={val => handleChange('description', val)}
                  multiline
                  error={errors.description}
                />
                {/* Amount Input */}
                <InputField
                  label="Amount"
                  placeholder="Enter amount"
                  value={form.amount.toString()}
                  onChangeText={val => handleChange('amount', val)}
                  keyboardType="numeric"
                  error={errors.amount}
                />
                <View style={styles.formBtnRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => {
                      setModalVisible(false);
                      setEditMode(false);
                      setEditId(null);
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

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxWidth: 420, width: '92%' }]}>
            {' '}
            {/* limit modal width for filter */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.darkBlue} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalContainer}>
              {/* Hotel Dropdown */}
              <DropdownField
                label="Hotel"
                placeholder="All Hotels"
                value={filterHotelId}
                onSelect={item => setFilterHotelId(item.value)}
                options={[
                  { label: 'All Hotels', value: '' },
                  ...(hotels || []).map(hotel => ({
                    label: hotel.name,
                    value: hotel.id,
                  })),
                ]}
              />
              {/* Platform Dropdown */}
              <DropdownField
                label="Platform"
                placeholder="All Platforms"
                value={filterPlatform}
                onSelect={item => setFilterPlatform(item.value)}
                options={platformModes?.map(platform => ({
                  label: platform.name,
                  value: platform.name,
                }))}
              />
              {/* Mode Dropdown */}
              <DropdownField
                label="Mode"
                placeholder="All Modes"
                value={filterMode}
                onSelect={item => setFilterMode(item.value)}
                options={[
                  { label: 'Credit', value: 'Credit' },
                  { label: 'Transfer', value: 'Transfer' },
                ]}
              />
              {/* From Date */}
              <Text style={styles.label}>From Date</Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  },
                ]}
                onPress={() => setShowFromDatePicker(true)}
              >
                <Text style={{ color: filterFromDate ? Colors.darkBlue : '#888' }}>
                  {filterFromDate ? filterFromDate : 'dd-mm-yyyy'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={Colors.orange} />
              </TouchableOpacity>
              {showFromDatePicker && (
                <Modal
                  visible={showFromDatePicker}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setShowFromDatePicker(false)}
                >
                  <View style={styles.modalContainers}>
                    <View style={styles.calendarWrapper}>
                      <Calendar
                        onDayPress={day => {
                          setFilterFromDate(day.dateString);
                          setShowFromDatePicker(false);
                        }}
                        markedDates={
                          filterFromDate
                            ? {
                                [filterFromDate]: {
                                  selected: true,
                                  selectedColor: Colors.darkBlue,
                                },
                              }
                            : {}
                        }
                        theme={{
                          todayTextColor: Colors.darkBlue,
                          selectedDayBackgroundColor: Colors.darkBlue,
                          arrowColor: Colors.darkBlue,
                        }}
                      />
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setShowFromDatePicker(false)}
                      >
                        <Text style={styles.closeButtonText}>Close</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              )}
              {/* To Date */}
              <Text style={styles.label}>To Date</Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  },
                ]}
                onPress={() => setShowToDatePicker(true)}
              >
                <Text style={{ color: filterToDate ? Colors.darkBlue : '#888' }}>
                  {filterToDate ? filterToDate : 'dd-mm-yyyy'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={Colors.orange} />
              </TouchableOpacity>
              {showToDatePicker && (
                <Modal
                  visible={showToDatePicker}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setShowToDatePicker(false)}
                >
                  <View style={styles.modalContainers}>
                    <View style={styles.calendarWrapper}>
                      <Calendar
                        onDayPress={day => {
                          setFilterToDate(day.dateString);
                          setShowToDatePicker(false);
                        }}
                        markedDates={
                          filterToDate
                            ? {
                                [filterToDate]: {
                                  selected: true,
                                  selectedColor: Colors.darkBlue,
                                },
                              }
                            : {}
                        }
                        theme={{
                          todayTextColor: Colors.darkBlue,
                          selectedDayBackgroundColor: Colors.darkBlue,
                          arrowColor: Colors.darkBlue,
                        }}
                      />
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setShowToDatePicker(false)}
                      >
                        <Text style={styles.closeButtonText}>Close</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              )}
              {/* Modal Actions */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 20,
                }}
              >
                <TouchableOpacity
                  style={[styles.clearlBtn, { flex: 1, marginRight: 10 }]}
                  onPress={handleClearFilter}
                >
                  <Text style={styles.cancelBtnText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, { flex: 1 }]}
                  onPress={() => {
                    handleApplyFilter();
                    setFilterModalVisible(false);
                  }}
                >
                  <Text style={styles.submitBtnText}>Apply</Text>
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
        title="Delete Payment"
        message="Are you sure you want to delete this payment?"
      />
      <DeleteAlert
        visible={showBulkDeleteModal}
        onConfirm={confirmBulkDelete}
        onCancel={cancelBulkDelete}
        title="Delete Payments"
        message={`Are you sure you want to delete ${
          selectedIds.size
        } selected payment${selectedIds.size === 1 ? '' : 's'}?`}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.veryLightBlue,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 2,
    shadowColor: Colors.darkBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    color: Colors.darkBlue,
    fontFamily: 'Poppins-Bold',
  },
  addBtn: {
    backgroundColor: Colors.orange,
    borderRadius: 20,
    padding: 6,
    elevation: 2,
  },
  listContainer: {
    padding: 16,
  },
  hotelCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 26,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.darkBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  hotelInfo: {
    flex: 1,
  },
  paymentDebit: {
    color: Colors.red,
  },
  paymentCredit: {
    color: Colors.green,
  },
  hotelName: {
    fontSize: 16,
    color: Colors.darkBlue,
    fontFamily: 'Poppins-SemiBold',
  },
  hotelLocation: {
    fontSize: 13,
    color: Colors.orange,
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
    backgroundColor: Colors.white,
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
    color: Colors.darkBlue,
    fontFamily: 'Poppins-Bold',
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
    fontWeight: '600',
    color: Colors.darkBlue,
    fontFamily: 'Poppins-SemiBold',
  },
  inputGroup: {
    marginBottom: 10,
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: Colors.darkBlue,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 2,
  },
  input: {
    borderWidth: 1.2,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: Colors.darkBlue,
  },
  inputError: {
    borderColor: Colors.red,
    borderWidth: 2,
  },
  errorText: {
    color: Colors.red,
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
    backgroundColor: Colors.LightGray,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    marginRight: 10,
  },
  clearlBtn: {
    backgroundColor: Colors.LightGray,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelBtnText: {
    color: Colors.darkBlue,
    fontFamily: 'Poppins-SemiBold',
    alignItems: 'center',
    fontSize: 15,
  },
  submitBtn: {
    backgroundColor: Colors.orange,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  submitBtnText: {
    color: Colors.white,
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
    backgroundColor: Colors.white,
    padding: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.darkBlue,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    color: Colors.white,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: Colors.LightGray,
    paddingVertical: 12,
    paddingHorizontal: 4,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  tableCell: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    textAlign: 'center',
    color: Colors.CharcoalGray,
    paddingHorizontal: 4,
  },
  tableActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    backgroundColor: Colors.white,
    marginVertical: 6,
  },
  dateInput: {
    flex: 1,
    padding: 12,
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: Colors.darkBlue,
  },
  calendarIcon: {
    padding: 12,
    borderLeftWidth: 1,
    borderLeftColor: Colors.LightGray,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 18,
    margin: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateText: {
    color: Colors.darkBlue,
    fontFamily: 'Poppins-SemiBold',
  },
  modeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modeBadgeText: {
    color: Colors.white,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  modeCredit: {
    backgroundColor: 'rgba(40,167,69,0.9)',
  },
  modeTransfer: {
    backgroundColor: 'rgba(111,66,193,0.9)',
  },
  modeDefault: {
    backgroundColor: Colors.gray,
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f3f5',
  },
  platformChip: {
    borderWidth: 1,
    borderColor: '#dbe4ff',
  },
  relatedChip: {
    borderWidth: 1,
    borderColor: Colors.LightGray,
    backgroundColor: '#f8f0fc',
  },
  chipText: {
    marginLeft: 6,
    color: Colors.darkBlue,
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.LightGray,
    marginVertical: 8,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  amountPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  creditPill: {
    borderWidth: 1,
    borderColor: 'rgba(40,167,69,0.2)',
  },
  debitPill: {
    borderWidth: 1,
    borderColor: 'rgba(220,53,69,0.2)',
  },
  amountLabel: {
    marginLeft: 6,
    flex: 1,
    color: Colors.CharcoalGray,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  amountValue: {
    fontFamily: 'Poppins-Bold',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  balanceLabel: {
    color: Colors.CharcoalGray,
    fontFamily: 'Poppins-SemiBold',
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#dbe4ff',
  },
  balanceValue: {
    color: Colors.darkBlue,
    fontFamily: 'Poppins-Bold',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.darkBlue,
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  cardLabel: {
    fontWeight: 'bold',
    color: Colors.CharcoalGray,
    width: 100,
  },
  cardValue: {
    flex: 1,
    color: Colors.gray,
  },
  platformValue: {
    flex: 1,
    color: Colors.orange,
  },
  totalsContainer: {
    backgroundColor: Colors.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.LightGray,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.darkBlue,
  },
  totalValue: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  debitAmount: {
    color: Colors.red,
  },
  creditAmount: {
    color: Colors.green,
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
    backgroundColor: Colors.orange,
  },
  modalContainers: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  calendarWrapper: {
    margin: 20,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    elevation: 5,
  },
  closeButton: {
    marginTop: 10,
    alignSelf: 'center',
    padding: 10,
    backgroundColor: Colors.darkBlue,
    borderRadius: 8,
  },
  closeButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  balanceContainer: {
    marginVertical: 16, // Adds spacing around the balance information
    padding: 10, // Adds padding around the text
    borderRadius: 8, // Rounded corners for a cleaner look
    backgroundColor: '#e4f0f1ff', // Light background for the balance container
    borderColor: '#E0E0E0', // Light border to separate from other content
    borderWidth: 1, // Border width for the balance container
    shadowColor: '#615a5aff', // Shadow for better elevation effect
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // Elevation effect for Android
  },
  platformName: {
    fontSize: 18, // Slightly larger font for the platform name
    fontWeight: 'bold', // Bold font to highlight the platform name
    color: '#333', // Dark color for better readability
    marginBottom: 4, // Adds space below the platform name
  },
  balanceText: {
    fontSize: 16, // Regular size for balance text
    color: '#666', // A slightly lighter color for balance text
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold', // Bold font to emphasize the balance amount
    color: Colors.darkBlue, // Use a contrasting color for the balance amount
  },
});
