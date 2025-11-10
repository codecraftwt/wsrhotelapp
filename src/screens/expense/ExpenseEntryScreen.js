import React, { useEffect, useState, useRef } from 'react';
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
  Platform,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  resetExpenses,
} from '../../redux/slices/expenseSlice';
import { fetchHotels } from '../../redux/slices/hotelSlice';
import DropdownField from '../../components/DropdownField';
import DeleteAlert from '../../components/DeleteAlert';
import {
  showValidationError,
  showSaveSuccess,
  showUpdateSuccess,
  showSaveError,
} from '../../utils/toastUtils';
import Toast from 'react-native-toast-message';
import { Calendar } from 'react-native-calendars';
import CalendarModal from '../../components/CalendarModal';
import { TouchableWithoutFeedback, Keyboard } from 'react-native';
import { fetchPaymentModes } from '../../redux/slices/paymentModesSlice';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Colors } from '../../assets/globleStyles/colors';

const VALIDATION_RULES = {
  hotel_id: { required: true },
  title: { required: true, minLength: 2, maxLength: 100 },
  amount: { required: true, pattern: /^\d+(\.\d{1,2})?$/ },
  payment_mode: { required: true },
  expense_date: { required: true },
  notes: { required: false, maxLength: 200 },
};

// TableView Component for Expenses
const TableView = ({
  data,
  hotels,
  onEdit,
  onDelete,
  onEndReached,
  onEndReachedThreshold,
  ListFooterComponent,
  refreshing,
  setRefreshing,
  selectionMode,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}) => {
  const { t } = useTranslation();
  const scrollViewRef = useRef(null);
  const dispatch = useDispatch();

  return (
    <View style={styles.tableContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        ref={scrollViewRef}
      >
        <View>
          {/* Table Header */}
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
            <Text style={[styles.tableHeaderCell, { width: 180 }]}>Title</Text>
            <Text style={[styles.tableHeaderCell, { width: 120 }]}>Hotel</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>Amount</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>Mode</Text>
            <Text style={[styles.tableHeaderCell, { width: 120 }]}>Date</Text>
            {/* <Text style={[styles.tableHeaderCell, { width: 100 }]}>
              Actions
            </Text> */}
          </View>

          {/* Table Content */}
          <FlatList
            data={data}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  dispatch(resetExpenses());
                  dispatch(
                    fetchExpenses({ page: 1, per_page: perPage, ...filters }),
                  ).finally(() => setRefreshing(false));
                }}
                colors={['#1c2f87', '#fe8c06']}
                tintColor={Colors.darkBlue}
              />
            }
            keyExtractor={item =>
              item?.id ? item.id.toString() : Math.random().toString()
            }
            renderItem={({ item }) => (
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
                      color={Colors.darkBlue}
                    />
                  ) : (
                    <Text style={{ color: 'transparent' }}>#</Text>
                  )}
                </TouchableOpacity>
                <Text
                  style={[styles.tableCell, { width: 180 }]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                <Text
                  style={[styles.tableCell, { width: 120 }]}
                  numberOfLines={1}
                >
                  {hotels.find(h => String(h.id) === String(item.hotel_id))
                    ?.name || 'Unknown'}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    {
                      width: 100,
                      color: Colors.orange,
                      fontFamily: 'Poppins-Bold',
                    },
                  ]}
                >
                  ₹{item.amount}
                </Text>
                <Text
                  style={[styles.tableCell, { width: 100 }]}
                  numberOfLines={1}
                >
                  {item.payment_mode}
                </Text>
                <Text
                  style={[styles.tableCell, { width: 120 }]}
                  numberOfLines={1}
                >
                  {item.expense_date}
                </Text>
                {/* <View style={[styles.tableActions, { width: 100 }]}>
                  <TouchableOpacity onPress={() => onEdit(item)}>
                    <Ionicons name="create-outline" size={20} color="#1c2f87" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onDelete(item.id)}>
                    <Ionicons name="trash-outline" size={20} color="#fe8c06" />
                  </TouchableOpacity>
                </View> */}
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
};

export default function ExpenseEntryScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { expenses, page, hasMore, loading } = useSelector(
    state => state.expense,
  );
  const { hotels } = useSelector(state => state.hotel);

  const [form, setForm] = useState({
    hotel_id: '',
    title: '',
    amount: '',
    payment_mode: '',
    expense_date: '',
    notes: '',
    document: '',
    added_by: 2,
  });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [isTableView, setIsTableView] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    hotel_name: '',
    mode: '',
    from_date: '',
    to_date: '',
  });
  const [showExpenseDatePicker, setShowExpenseDatePicker] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  // Pagination state
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const perPage = 20;
  const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  useEffect(() => {
    dispatch(resetExpenses());
    dispatch(fetchExpenses({ page: 1, per_page: perPage }));
    dispatch(fetchHotels());
  }, [dispatch]);

  // Load more handler for infinite scroll
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && !loading) {
      setIsLoadingMore(true);
      dispatch(
        fetchExpenses({
          ...filters,
          page: page + 1,
          per_page: perPage,
        }),
      ).finally(() => setIsLoadingMore(false));
    }
  };

  // Filter apply handler (reset and fetch first page)
  const applyFilters = () => {
    setShowFilterModal(false);
    dispatch(resetExpenses());
    dispatch(fetchExpenses({ ...filters, page: 1, per_page: perPage }));
  };

  // Clear filters handler (reset and fetch first page)
  const clearFilters = () => {
    setFilters({
      hotel_name: '',
      mode: '',
      from_date: '',
      to_date: '',
    });
    setShowFilterModal(false);
    dispatch(resetExpenses());
    dispatch(fetchExpenses({ page: 1, per_page: perPage }));
  };

  // Remove client-side filtering
  // const filteredExpenses = expenses.filter(...)

  const handleExpenseDateChange = (event, selectedDate) => {
    setShowExpenseDatePicker(false);
    if (selectedDate) {
      const d = selectedDate;
      const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(d.getDate()).padStart(2, '0')}`;
      handleFilterChange('expense_date', formatted);
    }
  };
  const validateForm = () => {
    const newErrors = {};
    Object.keys(VALIDATION_RULES).forEach(field => {
      const value = form[field];
      const rules = VALIDATION_RULES[field];
      if (rules.required && (!value || String(value).trim() === '')) {
        // Custom error messages for dropdown fields
        if (field === 'hotel_id') {
          newErrors[field] = 'Please select a hotel';
        } else if (field === 'payment_mode') {
          newErrors[field] = 'Please select a payment mode';
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

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const d = selectedDate;
      const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(d.getDate()).padStart(2, '0')}`;
      handleChange('expense_date', formatted);
    }
  };

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      const d = selectedDate;
      const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(d.getDate()).padStart(2, '0')}`;
      handleFilterChange('start_date', formatted);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      const d = selectedDate;
      const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(d.getDate()).padStart(2, '0')}`;
      handleFilterChange('end_date', formatted);
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      // showValidationError();
      return;
    }

    const expenseData = {
      ...form,
      amount: parseFloat(form.amount), // Ensure amount is a number
    };

    if (editId) {
      dispatch(updateExpense({ ...expenseData, id: editId }))
        .then(() => {
          // showUpdateSuccess('Expense');
          Toast.show({
            type: 'success',
            text1: 'Updaed successfully',
          });
          closeForm();
          dispatch(fetchExpenses());
          dispatch(fetchExpenses({ page: 1, per_page: perPage, ...filters }));
        })
        .catch(error => {
          showSaveError('Expense');
        });
    } else {
      dispatch(addExpense(expenseData))
        .then(() => {
          // showSaveSuccess('Expense');
          Toast.show({
            type: 'success',
            text1: 'Added successfully',
          });
          closeForm();
          dispatch(fetchExpenses());
          dispatch(fetchExpenses({ page: 1, per_page: perPage, ...filters }));
        })
        .catch(error => {
          showSaveError('Expense');
        });
    }
  };

  const handleEdit = expense => {
    setForm(expense);
    setEditId(expense.id);
    setShowForm(true);
    setErrors({});
  };

  const [imageSource, setImageSource] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState(null); // Store the actual image file

  // Image picker options
  const imagePickerOptions = {
    mediaType: 'photo',
    includeBase64: false,
    maxHeight: 2000,
    maxWidth: 2000,
    quality: 0.8,
  };

  // Check if the image upload endpoint is available
  const checkImageUploadAvailability = async () => {
    try {
      const response = await fetch('https://your-api-base-url/upload-image', {
        method: 'HEAD',
        timeout: 5000,
      });
      return response.ok;
    } catch (error) {
      console.log('Image upload endpoint not available:', error);
      return false;
    }
  };

  // Upload image to server and get filename
  const uploadImage = async image => {
    setUploadingImage(true);
    try {
      // First check if upload endpoint is available
      const isAvailable = await checkImageUploadAvailability();

      if (!isAvailable) {
        throw new Error('Image upload service is currently unavailable');
      }

      const formData = new FormData();
      formData.append('image', {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: image.fileName || `bill_${Date.now()}.jpg`,
      });

      const response = await fetch('https://your-api-base-url/upload-image', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          // Add any required authentication headers
          // 'Authorization': 'Bearer your-token',
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return result.filename || result.document || result.data?.filename;
      } else {
        throw new Error(result.message || 'Image upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);

      // Show appropriate error message
      let errorMessage = 'Image upload failed';
      if (error.message.includes('Network request failed')) {
        errorMessage = 'Network error: Please check your internet connection';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Upload timeout: Please try again';
      } else {
        errorMessage = error.message;
      }

      Toast.show({
        type: 'error',
        text1: 'Upload Error',
        text2: errorMessage,
      });

      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Alternative approach: Convert image to base64 and store temporarily
  const convertImageToBase64 = async imageUri => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        const reader = new FileReader();
        reader.onloadend = function () {
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(xhr.response);
      };
      xhr.onerror = reject;
      xhr.open('GET', imageUri);
      xhr.responseType = 'blob';
      xhr.send();
    });
  };

  // Handle image selection with fallback options
  const handleSelectImage = async () => {
    launchImageLibrary(imagePickerOptions, async response => {
      if (response.didCancel) return;

      if (response.error) {
        Toast.show({
          type: 'error',
          text1: 'Error selecting image',
        });
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const image = response.assets[0];
        await processSelectedImage(image);
      }
    });
  };

  // Handle camera capture
  const handleTakePhoto = async () => {
    launchCamera(imagePickerOptions, async response => {
      if (response.didCancel) return;

      if (response.error) {
        Toast.show({
          type: 'error',
          text1: 'Error taking photo',
        });
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const image = response.assets[0];
        await processSelectedImage(image);
      }
    });
  };

  // Process the selected image
  const processSelectedImage = async image => {
    // Store the image file for later use
    setImageFile(image);
    setImageSource({ uri: image.uri });

    // Try to upload image immediately
    const filename = await uploadImage(image);

    if (filename) {
      setForm(prev => ({
        ...prev,
        document: filename,
      }));
    } else {
      // If upload fails, store image as base64 for temporary storage
      try {
        const base64Image = await convertImageToBase64(image.uri);
        // Store base64 in form or separate state for later upload attempt
        setForm(prev => ({
          ...prev,
          document_base64: base64Image, // Temporary field
        }));
      } catch (error) {
        console.error('Error converting image to base64:', error);
      }
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setForm(prev => ({
      ...prev,
      document: '',
      document_base64: '', // Clear temporary base64 if exists
    }));
    setImageSource(null);
    setImageFile(null);
  };

  // Retry image upload
  const handleRetryUpload = async () => {
    if (imageFile) {
      const filename = await uploadImage(imageFile);
      if (filename) {
        setForm(prev => ({
          ...prev,
          document: filename,
        }));
      }
    }
  };

  // Modified handleSubmit to handle image upload scenarios
  // const handleSubmit = async () => {
  //   if (!validateForm()) {
  //     return;
  //   }

  //   // Prepare the expense data
  //   const expenseData = {
  //     hotel_id: form.hotel_id,
  //     title: form.title,
  //     amount: parseFloat(form.amount),
  //     payment_mode: form.payment_mode,
  //     expense_date: form.expense_date,
  //     notes: form.notes,
  //     added_by: form.added_by,
  //     document: form.document, // This will be empty if upload failed
  //   };

  //   // If we have a base64 image but no document filename, ask user what to do
  //   if (form.document_base64 && !form.document) {
  //     Alert.alert(
  //       'Image Upload Failed',
  //       'The bill image could not be uploaded. Would you like to:',
  //       [
  //         {
  //           text: 'Try Upload Again',
  //           onPress: handleRetryUpload,
  //         },
  //         {
  //           text: 'Save Without Image',
  //           onPress: () => proceedWithExpenseSave(expenseData),
  //         },
  //         {
  //           text: 'Cancel',
  //           style: 'cancel',
  //         },
  //       ],
  //     );
  //     return;
  //   }

  //   proceedWithExpenseSave(expenseData);
  // };

  const proceedWithExpenseSave = expenseData => {
    if (editId) {
      dispatch(updateExpense({ ...expenseData, id: editId }))
        .then(() => {
          Toast.show({
            type: 'success',
            text1: 'Updated successfully',
          });
          closeForm();
          dispatch(fetchExpenses());
        })
        .catch(error => {
          showSaveError('Expense');
        });
    } else {
      dispatch(addExpense(expenseData))
        .then(() => {
          Toast.show({
            type: 'success',
            text1: 'Added successfully',
          });
          closeForm();
          dispatch(fetchExpenses());
        })
        .catch(error => {
          showSaveError('Expense');
        });
    }
  };

  // Render image upload section with status
  const renderImageUpload = () => (
    <View style={styles.imageUploadSection}>
      <Text style={styles.label}>Bill Image (Optional)</Text>

      {uploadingImage ? (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="small" color={Colors.darkBlue} />
          <Text style={styles.uploadingText}>Uploading image...</Text>
        </View>
      ) : imageSource ? (
        <View style={styles.imagePreviewContainer}>
          <Image source={imageSource} style={styles.imagePreview} />
          <View style={styles.imageActions}>
            {!form.document && form.document_base64 ? (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetryUpload}
              >
                <Ionicons name="refresh-outline" size={16} color={Colors.white} />
                <Text style={styles.retryButtonText}>Retry Upload</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={handleRemoveImage}
            >
              <Ionicons name="trash-outline" size={16} color={Colors.white} />
              <Text style={styles.removeImageText}>Remove</Text>
            </TouchableOpacity>
          </View>
          {!form.document && form.document_base64 ? (
            <Text style={styles.uploadWarning}>
              ⚠️ Image saved locally. Will try to upload on save.
            </Text>
          ) : form.document ? (
            <Text style={styles.uploadSuccess}>
              ✓ Image uploaded successfully
            </Text>
          ) : null}
        </View>
      ) : (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={showImagePickerOptions}
          disabled={uploadingImage}
        >
          <Ionicons name="camera-outline" size={24} color={Colors.darkBlue} />
          <Text style={styles.uploadButtonText}>Upload Bill Image</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Show image source options
  const showImagePickerOptions = () => {
    Alert.alert(
      'Select Bill Image',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: handleTakePhoto,
        },
        {
          text: 'Choose from Gallery',
          onPress: handleSelectImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  const handleDelete = id => {
    if (selectionMode) {
      toggleSelect(id);
      return;
    }
    setExpenseToDelete(id);
    setIsDeleteAlertVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteExpense(expenseToDelete));
      Toast.show({
        type: 'success',
        text1: 'Deleted successfully',
      });
      dispatch(fetchExpenses());
      dispatch(fetchExpenses({ page: 1, per_page: perPage, ...filters }));
      setIsDeleteAlertVisible(false);
      setExpenseToDelete(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete expense');
      setIsDeleteAlertVisible(false);
      setExpenseToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteAlertVisible(false);
    setExpenseToDelete(null);
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const idsArray = Array.from(selectedIds);
    try {
      await dispatch(deleteExpense(idsArray)).unwrap();
      Toast.show({ type: 'success', text1: 'Deleted successfully' });
      exitSelectionMode();
      dispatch(resetExpenses());
      dispatch(fetchExpenses({ page: 1, per_page: perPage }));
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete expenses',
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
    const allIds = expenses.map(e => e.id);
    const allSelected =
      allIds.length > 0 && allIds.every(id => selectedIds.has(id));
    setSelectedIds(allSelected ? new Set() : new Set(allIds));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchExpenses(filters));
    setRefreshing(false);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setErrors({});
    setForm({
      hotel_id: '',
      title: '',
      amount: '',
      payment_mode: '',
      expense_date: '',
      notes: '',
      document: '',
      added_by: 2,
    });
  };

  const { paymentModes, error } = useSelector(state => state.paymentModes);

  useEffect(() => {
    dispatch(fetchPaymentModes());
  }, [dispatch]);
  const renderPaymentDropdown = (field, placeholder, data) => (
    <View style={styles.inputGroup}>
      <DropdownField
        label="Payment Modes"
        placeholder={placeholder}
        value={form[field]}
        options={data.map(mode => ({ value: mode.name, label: mode.name }))}
        onSelect={item => handleChange(field, item.value)}
        error={errors[field]}
      />
    </View>
  );

  const renderHotelDropdown = (field, placeholder, data, getLabel) => (
    <View style={styles.inputGroup}>
      {/* <Text style={styles.label}>{placeholder}</Text> */}
      <DropdownField
        label="Hotels"
        placeholder={placeholder}
        value={form[field]}
        options={data.map(item => ({
          value: item.id || item.name,
          label: getLabel ? getLabel(item) : item.label,
        }))}
        onSelect={item => handleChange(field, item.value)}
        error={errors[field]}
      />
    </View>
  );

  const renderFilterDropdown = (field, label, options, getLabel = i => i) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.dropdown}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {options.map(option => (
            <TouchableOpacity
              key={option.id || option}
              style={[
                styles.dropdownOption,
                String(filters[field]) === String(option.id || option) &&
                  styles.dropdownOptionSelected,
              ]}
              onPress={() =>
                handleFilterChange(field, String(option.id || option))
              }
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  String(filters[field]) === String(option.id || option) &&
                    styles.dropdownOptionTextSelected,
                ]}
              >
                {getLabel(option)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderInput = (field, label, placeholder, options = {}) => (
    <View style={styles.inputGroup}>
      {/* <Text style={styles.label}>{label}</Text> */}
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

  const renderDatePicker = () => (
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
          errors.expense_date && styles.inputError,
        ]}
        onPress={() => {
          if (!form.expense_date) {
            const today = new Date().toISOString().split('T')[0];
            handleChange('expense_date', today);
          }
          setShowDatePicker(true);
        }}
      >
        <Text style={{ color: form.expense_date ? '#1c2f87' : '#888' }}>
          {form.expense_date ? form.expense_date : 'Select Expense Date'}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={Colors.orange} />
      </TouchableOpacity>

      <CalendarModal
        visible={showDatePicker}
        selectedDate={form.expense_date}
        onSelectDate={date => {
          handleChange('expense_date', date);
          setShowDatePicker(false);
        }}
        onClose={() => setShowDatePicker(false)}
      />

      {errors.expense_date && (
        <Text style={styles.errorText}>{errors.expense_date}</Text>
      )}
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color={Colors.darkBlue} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Hotel Dropdown */}
            <View style={styles.filterItem}>
              {/* <Text style={styles.filterLabel}>Hotel</Text> */}
              <DropdownField
                label="Hotels"
                placeholder="Select Hotel"
                value={filters.hotel_name || null}
                options={hotels.map(hotel => ({
                  value: hotel.name,
                  label: hotel.name,
                }))}
                onSelect={item => handleFilterChange('hotel_name', item.value)}
              />
            </View>

            {/* Payment Mode Dropdown */}
            {/* Payment Mode Dropdown */}
            <View style={styles.filterItem}>
              {/* <Text style={styles.filterLabel}>Payment Mode</Text> */}
              <DropdownField
                label="Payment Modes"
                placeholder="Select Payment Mode"
                value={filters.mode || null}
                options={paymentModes.map(mode => ({
                  value: mode.name,
                  label: mode.name,
                }))}
                onSelect={item => handleFilterChange('mode', item.value)}
              />
            </View>

            {/* From Date Picker */}
            <View style={styles.filterItem}>
              {/* <Text style={styles.filterLabel}>From Date</Text> */}
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowFromDatePicker(true)}
              >
                <Text
                  style={
                    filters.from_date
                      ? styles.dateInputText
                      : styles.dateInputPlaceholder
                  }
                >
                  {filters.from_date || 'Select From Date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={Colors.darkBlue} />
              </TouchableOpacity>
            </View>
            {showFromDatePicker && (
              <Modal
                visible={showFromDatePicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowFromDatePicker(false)}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.calendarWrapper}>
                    <Calendar
                      onDayPress={day => {
                        const formattedDate = day.dateString; // YYYY-MM-DD
                        setFilters(prev => ({
                          ...prev,
                          from_date: formattedDate,
                        }));
                        setShowFromDatePicker(false);
                      }}
                      markedDates={
                        filters.from_date
                          ? {
                              [filters.from_date]: {
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

            {/* To Date Picker */}
            <View style={styles.filterItem}>
              {/* <Text style={styles.filterLabel}>To Date</Text> */}
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowToDatePicker(true)}
              >
                <Text
                  style={
                    filters.to_date
                      ? styles.dateInputText
                      : styles.dateInputPlaceholder
                  }
                >
                  {filters.to_date || 'Select To Date'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={Colors.darkBlue} />
              </TouchableOpacity>
            </View>
            {showToDatePicker && (
              <Modal
                visible={showToDatePicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowToDatePicker(false)}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.calendarWrapper}>
                    <Calendar
                      onDayPress={day => {
                        const formattedDate = day.dateString;
                        setFilters(prev => ({
                          ...prev,
                          to_date: formattedDate,
                        }));
                        setShowToDatePicker(false);
                      }}
                      markedDates={
                        filters.to_date
                          ? {
                              [filters.to_date]: {
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

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.clearFilterButton]}
                onPress={clearFilters}
              >
                <Text style={styles.clearFilterButtonText}>Clear Filters</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.applyButton]}
                onPress={applyFilters}
              >
                <Text style={styles.modalButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      {selectionMode ? (
        <View style={styles.headerRow}>
          <Text
            style={styles.headerTitle}
          >{`${selectedIds.size} selected`}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.viewToggleBtn}
              onPress={toggleSelectAll}
            >
              <Ionicons
                name={
                  expenses.length > 0 &&
                  expenses.every(e => selectedIds.has(e.id))
                    ? 'checkbox-outline'
                    : 'square-outline'
                }
                size={22}
                color={Colors.darkBlue}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewToggleBtn}
              //  onPress={() => setShowBulkDeleteModal(true)}
              onPress={() => {
                if (selectedIds.size > 0) {
                  setShowBulkDeleteModal(true);
                } else {
                  Toast.show({
                    type: 'error',
                    text1: 'No expense selected',
                    // text2: 'Please select at least one material request to delete.',
                  });
                }
              }}
            >
              <Ionicons name="trash-outline" size={22} color={Colors.orange} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={exitSelectionMode}>
              <Ionicons name="close" size={22} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{t('Expenses')}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Ionicons
                name="filter"
                size={22}
                color={showFilters ? '#fe8c06' : '#1c2f87'}
              />
              {Object.values(filters).some(val => val !== '') && (
                <View style={styles.filterBadge} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewToggleBtn}
              onPress={() => setIsTableView(!isTableView)}
            >
              <Ionicons
                name={isTableView ? 'list-outline' : 'grid-outline'}
                size={22}
                color={Colors.darkBlue}
              />
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={[styles.viewToggleBtn, { marginRight: 8 }]}
              onPress={() => enterSelectionMode()}
            >
              <Ionicons name="checkbox-outline" size={22} color="#1c2f87" />
            </TouchableOpacity> */}
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setShowForm(true)}
            >
              <Ionicons name="add" size={26} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {isTableView ? (
        <>
          <TableView
            data={expenses}
            hotels={hotels}
            onEdit={handleEdit}
            refreshing={refreshing}
            setRefreshing={setRefreshing}
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
          {expenses?.length === 0 && (
            <Text style={styles.emptyText}>{t('No expenses found.')}</Text>
          )}
        </>
      ) : (
        <>
          <FlatList
            data={expenses}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  dispatch(resetExpenses());
                  dispatch(
                    fetchExpenses({ page: 1, per_page: perPage, ...filters }),
                  ).finally(() => setRefreshing(false));
                }}
                colors={['#1c2f87', '#fe8c06']}
                tintColor={Colors.darkBlue}
              />
            }
            keyExtractor={item =>
              item?.id ? item.id.toString() : Math.random().toString()
            }
            contentContainerStyle={[
              styles.listContainer,
              { paddingBottom: 10 },
            ]}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.expenseCard}
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
                        selectedIds.has(item.id)
                          ? 'checkbox-outline'
                          : 'square-outline'
                      }
                      size={22}
                      color={Colors.darkBlue}
                    />
                  </View>
                )}
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseTitle}>{item.title}</Text>
                  <Text style={styles.expenseDetails}>
                    {hotels.find(h => String(h.id) === String(item.hotel_id))
                      ?.name || 'Unknown'}{' '}
                    • {item.payment_mode} • ₹{item.amount}
                  </Text>
                  <Text style={styles.expenseDate}>
                    Date: {item.expense_date}
                  </Text>
                  <Text style={styles.expenseNotes}>{item.notes}</Text>
                </View>
                {/* {!selectionMode && (
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
                      onPress={() => handleDelete(item.id)}
                      style={styles.iconBtn}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={22}
                        color="#fe8c06"
                      />
                    </TouchableOpacity>
                  </View>
                )} */}
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
            ListEmptyComponent={
              <Text style={styles.emptyText}>{t('No expenses found.')}</Text>
            }
          />
        </>
      )}
      <View style={styles.totalAmountContainer}>
        <Text style={styles.totalAmountLabel}>Total Expenses:</Text>
        <Text style={styles.totalAmountValue}>
          ₹
          {expenses
            .reduce((total, expense) => total + parseFloat(expense.amount), 0)
            .toFixed(2)}
        </Text>
      </View>

      {renderFilterModal()}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={closeForm}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editId ? t('Update Expense') : t('Add Expense')}
                </Text>
                <TouchableOpacity onPress={closeForm}>
                  <Ionicons name="close" size={24} color={Colors.darkBlue} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {renderHotelDropdown(
                  'hotel_id',
                  'Select Hotel',
                  hotels,
                  h => h.name,
                )}
                {renderInput('title', 'Title', 'Enter expense title')}
                {renderInput('amount', 'Amount', 'Enter amount', {
                  keyboardType: 'numeric',
                })}
                {renderPaymentDropdown(
                  'payment_mode',
                  'Select Payment Mode',
                  paymentModes,
                )}
                {renderDatePicker()}
                {/* {renderImageUpload()} */}
                {renderInput('notes', 'Notes', 'Enter notes (optional)', {
                  multiline: true,
                  numberOfLines: 3,
                })}
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
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <DeleteAlert
        visible={isDeleteAlertVisible}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense?"
      />
      <DeleteAlert
        visible={showBulkDeleteModal}
        onConfirm={confirmBulkDelete}
        onCancel={cancelBulkDelete}
        title="Delete Expenses"
        message={`Are you sure you want to delete ${
          selectedIds.size
        } selected expense${selectedIds.size === 1 ? '' : 's'}?`}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  imageUploadSection: {
    marginBottom: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.darkBlue,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#f8f9ff',
  },
  uploadButtonText: {
    marginLeft: 8,
    color: Colors.darkBlue,
    fontSize: 16,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  removeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff3b30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeImageText: {
    color: Colors.white,
    marginLeft: 4,
    fontSize: 14,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  uploadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 16,
  },
  filenameText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  submitBtnDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },

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
    fontSize: 20,
    color: Colors.darkBlue,
    fontFamily: 'Poppins-Bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    // backgroundColor: '#f8f9fa',
    // borderRadius: 20,
    padding: 8,
    marginRight: 12,
    // borderWidth: 1,
    // borderColor: '#e9ecef',
  },
  viewToggleBtn: {
    // backgroundColor: '#f8f9fa',
    // borderRadius: 20,
    padding: 8,
    marginRight: 12,
    // borderWidth: 1,
    // borderColor: '#e9ecef',
  },
  addBtn: {
    backgroundColor: Colors.orange,
    borderRadius: 20,
    padding: 6,
    // elevation: 2,
  },
  listContainer: {
    padding: 16,
  },
  expenseCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
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
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 16,
    color: Colors.darkBlue,
    fontFamily: 'Poppins-SemiBold',
  },
  expenseDetails: {
    fontSize: 13,
    color: Colors.orange,
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  expenseDate: {
    fontSize: 12,
    color: Colors.darkBlue,
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  expenseNotes: {
    fontSize: 12,
    color: Colors.gray,
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
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: Colors.darkBlue,
    backgroundColor: Colors.white,
  },
  inputError: {
    borderColor: Colors.red,
    borderWidth: 2,
  },
  errorText: {
    color: Colors.red,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
    marginLeft: 4,
  },
  dropdown: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    backgroundColor: Colors.white,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    minHeight: 40,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: Colors.LightGray,
  },
  dropdownOptionSelected: {
    backgroundColor: Colors.darkBlue,
    borderColor: Colors.darkBlue,
  },
  dropdownOptionText: {
    fontSize: 12,
    color: Colors.gray,
    fontFamily: 'Poppins-Regular',
  },
  dropdownOptionTextSelected: {
    color: Colors.white,
    fontFamily: 'Poppins-SemiBold',
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
  cancelBtnText: {
    color: Colors.darkBlue,
    fontFamily: 'Poppins-SemiBold',
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
  // TableView styles
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
    color: '#495057',
    paddingHorizontal: 4,
  },
  tableActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  tableScrollView: {
    flexGrow: 1,
  },
  // Filter styles
  filterButton: {
    // backgroundColor: '#f8f9fa',
    // borderRadius: 20,
    padding: 8,
    marginRight: 12,
    // borderWidth: 1,
    // borderColor: '#e9ecef',
    position: 'relative',
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
  filterContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  filterHeaderText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.darkBlue,
  },
  filterContent: {
    padding: 16,
  },
  filterItem: {
    // marginBottom: 6,
  },
  filterLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: Colors.gray,
    marginBottom: 6,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: Colors.LightGray,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    marginBottom: 8,
  },
  dateInputText: {
    fontSize: 18,
    // fontFamily: 'Poppins-Regular',
    color: Colors.darkBlue,
  },
  dateInputPlaceholder: {
    color: Colors.gray,
     fontSize: 18,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  applyButton: {
    backgroundColor: Colors.darkBlue,
  },
  clearFilterButton: {
    backgroundColor: Colors.LightGray,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 8,
  },
  clearFilterButtonText: {
    color: Colors.darkBlue,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  modalButtonText: {
    color: Colors.white,
    fontSize: 16,
  },
  scrollViewContent: {
    paddingBottom: 60,
  },
  totalAmountContainer: {
    // position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingVertical: 22,
    backgroundColor: Colors.white,
    borderTopColor: Colors.darkBlue,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 5,
  },
  totalAmountLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.darkBlue,
  },
  totalAmountValue: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: Colors.orange,
  },
  filterItem: {
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
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
});
