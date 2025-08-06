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
} from '../../redux/slices/paymentLedgerSlice';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { fetchHotels } from '../../redux/slices/hotelSlice';
import { 
  showValidationError, 
  showSaveSuccess, 
  showUpdateSuccess, 
  showSaveError 
} from '../../utils/toastUtils';
import DeleteAlert from '../../components/DeleteAlert';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
}) => (
  <View style={styles.tableContainer}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={styles.tableHeader}>
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
                      color="#fff"
                    />
                  </View>
                )}
                {item.transfer_name && item.mode === 'Credit' && (
                  <View
                    style={[styles.arrowIcon, { backgroundColor: '#9C27B0' }]}
                  >
                    <MaterialIcons name="arrow-back" size={16} color="#fff" />
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
                  <Ionicons name="create-outline" size={20} color="#1c2f87" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="#fe8c06" />
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
  const { paymentLedgers, totals, loading, error, page, hasMore } = useSelector(
    state => state.paymentLedger,
  );
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

  const renderDateInput = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Expense Date</Text>
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
        <Text style={{ color: form.date ? '#1c2f87' : '#888' }}>
          {form.date ? form.date : 'dd-mm-yyyy'}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#fe8c06" />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={form.date ? new Date(form.date) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}
      {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Payment Ledger</Text>
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
              setErrors({}); // Clear errors when adding new
              setModalVisible(true);
            }}
          >
            <Ionicons name="add" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar and rest of the screen */}
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
            placeholder="Search by description or platform"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
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
      </View>

      {viewMode === 'list' ? (
        <FlatList
          data={filteredPayments}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.materialInfo}>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Date:</Text>
                  <Text style={[styles.cardValue, styles.amount]}>
                    {item.date}
                  </Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Platform:</Text>
                  <Text style={[styles.cardValue, styles.amount]}>
                    {item.platform_name}
                  </Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Related Platform:</Text>
                  <Text style={[styles.cardValue, styles.platformValue]}>
                    {item.transfer_name}
                  </Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Mode:</Text>
                  <Text style={[styles.cardValue, styles.amount]}>
                    {item.mode}
                  </Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={[styles.cardLabel, styles.creditAmount]}>
                    Credit:
                  </Text>
                  <Text style={[styles.cardValue, styles.paymentCredit]}>
                    {item?.credit === '0.00' || Number(item?.credit) === 0
                      ? '-'
                      : item?.credit}{' '}
                  </Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Debit:</Text>
                  <Text style={[styles.cardValue, styles.paymentDebit]}>
                    {item?.debit === '0.00' || Number(item?.debit) === 0
                      ? '-'
                      : item?.debit}
                  </Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Balance:</Text>
                  <Text style={[styles.cardValue, styles.amount]}>
                    {item.balance}
                  </Text>
                </View>
              </View>
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
                  <Ionicons name="create-outline" size={20} color="#1c2f87" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="#fe8c06" />
                </TouchableOpacity>
              </View>
            </View>
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
                <Ionicons name="close" size={24} color="#1c2f87" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalContainer} showsVerticalScrollIndicator={false}>
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
              {/* Conditionally render "Transfer To" dropdown */}
              {form.mode === 'Transfer' && (
                <DropdownField
                  label="Transfer To"
                  placeholder="Select related platform"
                  value={relatedPlatform}
                  onSelect={item => handleChange('relatedPlatform', item.value)}
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
                label="Description"
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
                <Ionicons name="close" size={24} color="#1c2f87" />
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
                <Text style={{ color: filterFromDate ? '#1c2f87' : '#888' }}>
                  {filterFromDate ? filterFromDate : 'dd-mm-yyyy'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#fe8c06" />
              </TouchableOpacity>
              {showFromDatePicker && (
                <DateTimePicker
                  value={filterFromDate ? new Date(filterFromDate) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleFromDateChange}
                />
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
                <Text style={{ color: filterToDate ? '#1c2f87' : '#888' }}>
                  {filterToDate ? filterToDate : 'dd-mm-yyyy'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#fe8c06" />
              </TouchableOpacity>
              {showToDatePicker && (
                <DateTimePicker
                  value={filterToDate ? new Date(filterToDate) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleToDateChange}
                />
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
  hotelCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 26,
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
  hotelInfo: {
    flex: 1,
  },
  paymentDebit: {
    color: '#dc3545',
  },
  paymentCredit: {
    color: '#28a745',
  },
  hotelName: {
    fontSize: 16,
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
  },
  hotelLocation: {
    fontSize: 13,
    color: '#fe8c06',
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
  inputGroup: {
    marginBottom: 10,
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 2,
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
  clearlBtn: {
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelBtnText: {
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
    alignItems: 'center',
    fontSize: 15,
  },
  submitBtn: {
    backgroundColor: '#1c2f87',
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 26,
    margin: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1c2f87',
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  cardLabel: {
    fontWeight: 'bold',
    color: '#495057',
    width: 100,
  },
  cardValue: {
    flex: 1,
    color: '#6c757d',
  },
  platformValue: {
    flex: 1,
    color: '#fe8c06',
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
  
});
