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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import {
  addPaymentMode,
  deletePaymentMode,
  editPaymentMode,
  fetchPaymentModes,
  bulkDeletePaymentModes,
} from '../../redux/slices/paymentModesSlice';
import Toast from 'react-native-toast-message';
import DeleteAlert from '../../components/DeleteAlert';
import SearchComponent from '../../components/SearchComponent';
import { Color } from 'react-native/types_generated/Libraries/Animated/AnimatedExports';
import { Colors } from '../../assets/globleStyles/colors';

const VALIDATION_RULES = {
  name: { required: true, minLength: 2, maxLength: 50 },
};

const TableView = ({
  data,
  onEdit,
  onDelete,
  selectionMode,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}) => {
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
            <Text style={[styles.tableHeaderCell, { width: 250 }]}>
              Payment Method
            </Text>
            <Text style={[styles.tableHeaderCell, { width: 150 }]}>
              Actions
            </Text>
          </View>

          {/* Table Content */}
          <View>
            {data.map(item => (
              <View key={item.id.toString()} style={styles.tableRow}>
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
                <Text style={[styles.tableCell, { width: 250 }]}>
                  {item.name}
                </Text>
                <View style={[styles.tableActions, { width: 150 }]}>
                  <TouchableOpacity onPress={() => onEdit(item)}>
                    <Ionicons name="create-outline" size={20} color={Colors.darkBlue} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onDelete(item.id)}>
                    <Ionicons name="trash-outline" size={20} color={Colors.orange} />
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

export default function PaymentModesScreen() {
  const dispatch = useDispatch();
  const paymentModes = useSelector(state => state.paymentModes.paymentModes); // Fetch payment modes from Redux
  const loading = useSelector(state => state.paymentModes.loading);

  // Form state
  const [form, setForm] = useState({ name: '' });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPaymentModes, setFilteredPaymentModes] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  useEffect(() => {
    dispatch(fetchPaymentModes());
  }, [dispatch]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPaymentModes(paymentModes);
    } else {
      const filtered = paymentModes.filter(mode =>
        mode.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredPaymentModes(filtered);
    }
  }, [searchQuery, paymentModes]);

  // Handle search input change
  const handleSearchChange = text => {
    setSearchQuery(text);
  };

  // Form validation function
  const validateForm = () => {
    const newErrors = {};

    Object.keys(VALIDATION_RULES).forEach(field => {
      const value = form[field];
      const rules = VALIDATION_RULES[field];

      // Required field validation
      if (rules.required && (!value || value.trim() === '')) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
        return;
      }

      if (value && value.trim() !== '') {
        // Length validation
        if (rules.minLength && value.length < rules.minLength) {
          newErrors[field] = `${
            field.charAt(0).toUpperCase() + field.slice(1)
          } must be at least ${rules.minLength} characters`;
        } else if (rules.maxLength && value.length > rules.maxLength) {
          newErrors[field] = `${
            field.charAt(0).toUpperCase() + field.slice(1)
          } must be less than ${rules.maxLength} characters`;
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

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      // Toast.show({
      //   type: 'error',
      //   position: 'top',
      //   text1: 'Validation Error',
      //   text2: 'Please fill required fields with valid values.',
      //   visibilityTime: 3000,
      // });
      return;
    }

    const paymentModeData = {
      ...form,
      name: form.name.trim(),
    };

    if (editId) {
      // Update existing payment mode
      dispatch(editPaymentMode({ ...paymentModeData, id: editId }));
      // dispatch(fetchPaymentModes());
      Toast.show({
        type: 'success',
        text1: 'Updated Successfully',
      });
    } else {
      // Add new payment mode
      dispatch(addPaymentMode(paymentModeData));
      Toast.show({
        type: 'success',
        text1: 'Added Successfully',
      });
    }

    closeForm();
  };

  // Handle edit payment mode
  const handleEdit = paymentMode => {
    setForm({ ...paymentMode });
    setEditId(paymentMode.id);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = id => {
    if (selectionMode) {
      toggleSelect(id);
      return;
    }
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedId) {
      dispatch(bulkDeletePaymentModes(selectedId));
      Toast.show({
        type: 'success',
        text1: 'Deleted Successfully',
      });
    }
    setShowDeleteModal(false);
    setSelectedId(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedId(null);
  };

  // Close form and reset state
  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setErrors({});
    setForm({ name: '' });
  };

  // Refresh data
  const handleRefresh = () => {
    dispatch(fetchPaymentModes());
  };

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
    const allIds = filteredPaymentModes.map(p => p.id);
    const allSelected =
      allIds.length > 0 && allIds.every(id => selectedIds.has(id));
    setSelectedIds(allSelected ? new Set() : new Set(allIds));
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const idsArray = Array.from(selectedIds);
    try {
      await dispatch(bulkDeletePaymentModes(idsArray)).unwrap();
      Toast.show({ type: 'success', text1: 'Deleted successfully' });
      exitSelectionMode();
      dispatch(fetchPaymentModes());
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete payment modes',
      });
    } finally {
      setShowBulkDeleteModal(false);
    }
  };

  const cancelBulkDelete = () => setShowBulkDeleteModal(false);

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
                  filteredPaymentModes.length > 0 &&
                  filteredPaymentModes.every(p => selectedIds.has(p.id))
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
                    text1: 'No payment mode selected',
                    // text2: 'Please select at least one payment mode to delete.',
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
          <Text style={styles.headerTitle}>Payment Modes</Text>
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
                color={Colors.darkBlue}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewToggleBtn, { marginRight: 8 }]}
              onPress={() => enterSelectionMode()}
            >
              <Ionicons name="checkbox-outline" size={24} color={Colors.darkBlue} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setShowForm(true)}
            >
              <Ionicons name="add" size={26} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Search Bar */}
      <SearchComponent
        value={searchQuery}
        onChangeText={handleSearchChange}
        placeholder="Search payment modes..."
        resultsCount={filteredPaymentModes.length}
        showResults={true}
      />

      {/* Payment Modes List */}
      {viewMode === 'list' ? (
        <FlatList
          data={filteredPaymentModes}
          keyExtractor={item => item?.id?.toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={handleRefresh}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.paymentModeCard}
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
              <View style={styles.paymentModeInfo}>
                <Text style={styles.paymentModeName}>{item.name}</Text>
              </View>
              {!selectionMode && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    onPress={() => handleEdit(item)}
                    style={styles.iconBtn}
                  >
                    <Ionicons name="create-outline" size={22} color={Colors.darkBlue} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    style={styles.iconBtn}
                  >
                    <Ionicons name="trash-outline" size={22} color={Colors.orange} />
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchQuery.length > 0
                ? 'No payment modes found matching your search.'
                : 'No payment modes added yet.'}
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
            data={filteredPaymentModes}
            onEdit={handleEdit}
            onDelete={handleDelete}
            selectionMode={selectionMode}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={() => {
              if (!selectionMode) enterSelectionMode();
              toggleSelectAll();
            }}
          />
          {filteredPaymentModes.length === 0 && (
            <Text style={styles.emptyText}>
              {searchQuery.length > 0
                ? 'No payment modes found matching your search.'
                : 'No payment modes added yet.'}
            </Text>
          )}
        </ScrollView>
      )}

      {/* Add/Edit Payment Mode Modal */}
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
                {editId ? 'Update Payment Mode' : 'Add Payment Mode'}
              </Text>
              <TouchableOpacity onPress={closeForm}>
                <Ionicons name="close" size={24} color={Colors.darkBlue} />
              </TouchableOpacity>
            </View>

            <View>
              <Text style={styles.section}>Payment Mode Details</Text>
              {renderInput('name', 'Payment Method Name', {
                autoCapitalize: 'words',
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
            </View>
          </View>
        </View>
      </Modal>
      <DeleteAlert
        visible={showDeleteModal}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Payment Mode"
        message="Are you sure you want to delete this payment mode?"
      />
      <DeleteAlert
        visible={showBulkDeleteModal}
        onCancel={cancelBulkDelete}
        onConfirm={confirmBulkDelete}
        title="Delete Payment Modes"
        message={`Are you sure you want to delete ${
          selectedIds.size
        } selected payment mode${selectedIds.size === 1 ? '' : 's'}?`}
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
    fontSize: 20,
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
  paymentModeCard: {
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
  paymentModeInfo: {
    flex: 1,
  },
  paymentModeName: {
    fontSize: 14,
    color: Colors.darkBlue,
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
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
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
    justifyContent: 'center', // This centers the buttons horizontally
    alignItems: 'center',
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
});
