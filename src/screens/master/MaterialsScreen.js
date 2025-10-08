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
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import {
  addMaterialItem,
  deleteMaterialItem,
  editMaterialItem,
  fetchMaterialItems,
  resetMaterialItemsState,
} from '../../redux/slices/materialItemsSlice';
import DropdownField from '../../components/DropdownField';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchHotels } from '../../redux/slices/hotelSlice';
import Toast from 'react-native-toast-message';
import DeleteAlert from '../../components/DeleteAlert';
import Icon from 'react-native-vector-icons/FontAwesome';
// import Icon from 'react-native-vector-icons/Octicons';

const VALIDATION_RULES = {
  name: { required: true, minLength: 2, maxLength: 100 },
  unit: { required: true },
};

const TableView = React.memo(
  ({
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
  }) => {
    return (
      <View style={styles.tableContainer}>
        <ScrollView horizontal>
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
              <Text style={[styles.tableHeaderCell, { width: 250 }]}>
                Material Name
              </Text>
              <Text style={[styles.tableHeaderCell, { width: 250 }]}>Unit</Text>
              <Text style={[styles.tableHeaderCell, { width: 150 }]}>
                Actions
              </Text>
            </View>
            <FlatList
              data={data}
              keyExtractor={item => item.id.toString()}
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
                        color="#1c2f87"
                      />
                    ) : (
                      <Text style={{ color: 'transparent' }}>#</Text>
                    )}
                  </TouchableOpacity>
                  <Text style={[styles.tableCell, { width: 250 }]}>
                    {item?.name}
                  </Text>
                  <Text style={[styles.tableCell, { width: 250 }]}>
                    {item?.unit}
                  </Text>
                  <View style={[styles.tableActions, { width: 150 }]}>
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
              )}
              onEndReached={onEndReached}
              onEndReachedThreshold={onEndReachedThreshold}
              ListFooterComponent={ListFooterComponent}
            />
          </View>
        </ScrollView>
      </View>
    );
  },
);

export default function MaterialsScreen() {
  const dispatch = useDispatch();
  const {
    materialItems,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    isFetchingMore,
    hasMore,
  } = useSelector(state => state.materialItems);
  const hotels = useSelector(state => state.hotel.hotels);
  const hotelsLoading = useSelector(state => state.hotel.loading);

  // Pagination: Load more items when end is reached
  const perPage = 10;

  const handleLoadMore = () => {
    if (!isFetchingMore && hasMore && !loading) {
      dispatch(fetchMaterialItems(currentPage + 1));
    }
  };

  // Fetch materials on mount
  useEffect(() => {
    dispatch(resetMaterialItemsState());
    dispatch(fetchMaterialItems(1));
    dispatch(fetchHotels());
  }, [dispatch]);

  // Form state
  const [form, setForm] = useState({
    name: '',
    unit: '',
    // status: '',
    date: new Date().toISOString().split('T')[0],
  });
  const openForm = () => {
    // Reset form state and set date to current date when adding a new material
    setForm({
      name: '',
      unit: '',
      date: new Date().toISOString().split('T')[0], // Reset date to current date
    });
    setShowForm(true); // Show the modal
  };

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Filter materials based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMaterials(materialItems);
    } else {
      const filtered = materialItems.filter(material =>
        material.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredMaterials(filtered);
    }
  }, [searchQuery, materialItems]);

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
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
        return;
      }
      if (rules.required && (!value || value.toString().trim() === '')) {
        if (field === 'unit') {
          newErrors[field] = 'Please select a unit';
        } else {
          newErrors[field] = `${
            field.charAt(0).toUpperCase() + field.slice(1)
          } is required`;
        }
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
      const year = selectedDate.getFullYear();
      const month = ('0' + (selectedDate.getMonth() + 1)).slice(-2);
      const day = ('0' + selectedDate.getDate()).slice(-2);
      const formatted = `${year}-${month}-${day}`; // YYYY-MM-DD format in local time
      handleChange('date', formatted);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      // Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    const materialData = {
      ...form,
      name: form.name.trim(),
      date: form.date || new Date().toISOString().split('T')[0],
    };

    try {
      if (editId) {
        // Update existing material
        await dispatch(editMaterialItem(materialData)).unwrap();
        Toast.show({
          type: 'success',
          text1: 'Updated Successfully',
        });
      } else {
        // Add new material
        await dispatch(addMaterialItem(materialData)).unwrap();
        Toast.show({
          type: 'success',
          text1: 'Added Successfully',
        });
      }
      // Refresh the list after successful operation
      await dispatch(fetchMaterialItems(1));
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

  const handleDelete = id => {
    if (selectionMode) {
      toggleSelect(id);
      return;
    }
    setSelectedMaterialId(id);
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    if (!selectedMaterialId) return;

    try {
      await dispatch(deleteMaterialItem(selectedMaterialId)).unwrap();
      await dispatch(fetchMaterialItems()); // refresh list
      Toast.show({
        type: 'success',
        text1: 'Deleted Successfully',
      });
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to delete material');
    } finally {
      setShowDeleteModal(false);
      setSelectedMaterialId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedMaterialId(null);
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const idsArray = Array.from(selectedIds);
    try {
      await dispatch(deleteMaterialItem(idsArray));
      Toast.show({ type: 'success', text1: 'Deleted successfully' });
      exitSelectionMode();
      dispatch(fetchMaterialItems());
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete hotels',
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
    const allIds = filteredMaterials.map(h => h.id);
    const allSelected =
      allIds.length > 0 && allIds.every(id => selectedIds.has(id));
    setSelectedIds(allSelected ? new Set() : new Set(allIds));
  };

  // Close form and reset state
  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setErrors({});
    setForm({ name: '', unit: '', date: '' });
  };

  // Refresh data
  const handleRefresh = () => {
    dispatch(resetMaterialItemsState());
    dispatch(fetchMaterialItems(1));
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
                  filteredMaterials.length > 0 &&
                  filteredMaterials.every(h => selectedIds.has(h.id))
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
                    text1: 'No materials selected',
                    // text2: 'Please select at least one material to delete.',
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
              style={[styles.viewToggleBtn, { marginRight: 8 }]}
              onPress={() => enterSelectionMode()}
            >
              <Ionicons name="checkbox-outline" size={24} color="#1c2f87" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addBtn}
              // onPress={() => setShowForm(true)}
              onPress={openForm}
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
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingMore && hasMore ? (
              <View style={{ padding: 16, alignItems: 'center' }}>
                <Text>Loading more...</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.materialCard}
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
                    color="#1c2f87"
                  />
                </View>
              )}
              <View style={styles.materialInfo}>
                <Text style={styles.materialName}>{item.name}</Text>
                <View style={styles.unitContainer}>
                  {/* Icon for unit */}
                  <Icon name="balance-scale" size={12} color="#5e72e4" />
                  <Text style={styles.materialUnit}>{item.unit}</Text>
                </View>
              </View>
              {!selectionMode && (
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
              )}
              {/* </View> */}
            </TouchableOpacity>
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
        <TableView
          data={filteredMaterials}
          onEdit={handleEdit}
          onDelete={handleDelete}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={() => {
            if (!selectionMode) enterSelectionMode();
            toggleSelectAll();
          }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingMore && hasMore ? (
              <View style={{ padding: 16, alignItems: 'center' }}>
                <Text>Loading more...</Text>
              </View>
            ) : null
          }
        />
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
                  {errors.unit && (
                    <Text style={styles.errorText}>{errors.unit}</Text>
                  )}
                  {/* <View>
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
                        {form.date
                          ? new Date(form.date).toLocaleDateString()
                          : 'Select date'}
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
                  </View> */}
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
      <DeleteAlert
        visible={showDeleteModal}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Material"
        message="Are you sure you want to delete this material?"
      />
      <DeleteAlert
        visible={showBulkDeleteModal}
        onCancel={cancelBulkDelete}
        onConfirm={confirmBulkDelete}
        title="Delete Hotels"
        message={`Are you sure you want to delete ${
          selectedIds.size
        } selected material${selectedIds.size === 1 ? '' : 's'}?`}
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
    fontSize: 14,
    color: '#1c2f87',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  materialUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5e72e4', // Make unit text less prominent
    fontFamily: 'Poppins-Regular',
    marginLeft: 4, // Add some space between name and unit
    // textAlign: 'right', // Align unit text to the right
  },
  unitContainer: {
    flexDirection: 'row', // Align the icon and unit in a row
    alignItems: 'center', // Vertically center the icon and text
    // marginLeft: 10, // Space between the name and the unit
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
  footer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#6c757d',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  tableLoading: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableFooter: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
});
