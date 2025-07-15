import React, { useState, useEffect, useRef } from 'react';
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
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { InputField } from '../../components/InputField';
import DropdownField from '../../components/DropdownField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  fetchAllMaterials,
  addMaterial,
  updateMaterial,
  deleteMaterial,
  addMaterialRequest,
} from '../../redux/slices/materialSlice';
import { fetchHotels } from '../../redux/slices/hotelSlice';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import api from '../../api/axiosInstance';

const TableView = ({ data, onEdit, onDelete }) => {
  return (
    <View style={styles.tableContainer}>
      <ScrollView horizontal>
        <View>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: 150 }]}>Material</Text>
            <Text style={[styles.tableHeaderCell, { width: 150 }]}>Hotel</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>Quantity</Text>
            <Text style={[styles.tableHeaderCell, { width: 120 }]}>Request Date</Text>
            <Text style={[styles.tableHeaderCell, { width: 150 }]}>Remark</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>Status</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>Actions</Text>
          </View>

          {/* Table Content */}
          <View>
            {data.map(item => (
              <View key={item.id.toString()} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: 150 }]}>
                  {item.material?.name || 'N/A'}
                </Text>
                <Text style={[styles.tableCell, { width: 150 }]}>
                  {item.hotel?.name || 'N/A'}
                </Text>
                <Text style={[styles.tableCell, { width: 100 }]}>
                  {item.quantity}
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
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default function MaterialRequestScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { materials, loading, error } = useSelector(state => state.material);
  const { hotels, hotelsLoading } = useSelector(state => state.hotel);
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Add this state
  const [errors, setErrors] = useState({});
  const [filters, setFilters] = useState({
    hotelId: '',
    status: '',
  });
  const [showFilters, setShowFilters] = useState(false); // New state for showing/hiding filters
  console.log("materials--->", materials)
  const [form, setForm] = useState({
    id: null,
    materialId: '', // Add this field
    materialName: '',
    quantity: '',
    hotelId: '',
    status: '',
    remark: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [isModalVisible, setModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'table'
  const [allMaterials, setAllMaterials] = useState([]); // New state for all materials

  useEffect(() => {
    dispatch(fetchAllMaterials());
    dispatch(fetchHotels());
    // Fetch materials from the new API
    api.get(`materials`)
      .then(res => {
        setAllMaterials(res.data);
      })
      .catch(err => {
        console.error('Failed to fetch materials from new API', err);
      });
  }, [dispatch]);

  // Filter materials based on selected filters
  const filteredMaterials = materials?.filter(material => {
    const matchesHotel = filters.hotelId ? material.hotel_id === filters.hotelId : true;
    const matchesStatus = filters.status ? material.status === filters.status : true;
    return matchesHotel && matchesStatus;
  });

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false); // Always hide the picker after selection
    if (selectedDate) {
      setSelectedDate(selectedDate); // Update the selected date state
      const formattedDate = selectedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      handleChange('date', formattedDate); // Update the form state
    }
  };

  const hotelOptions =
    hotels?.map(hotel => ({
      value: hotel.id,
      label: hotel.name,
    })) || [];

  const units = [
    { label: 'kg', value: 'kg' },
    { label: 'g', value: 'g' },
    { label: 'lb', value: 'lb' },
    { label: 'piece', value: 'piece' },
    { label: 'liter', value: 'liter' },
    { label: 'ml', value: 'ml' },
  ];

  const categories = [
    { label: 'veg', value: 'veg' },
    { label: 'non-veg', value: 'non-veg' },
    { label: 'dairy', value: 'dairy' },
  ];

  const statuses = [
    { label: 'Completed', value: 'Completed' },
    { label: 'Pending', value: 'Pending' },
    { label: 'In Progress', value: 'In Progress' },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchAllMaterials());
      await dispatch(fetchHotels());
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleChange = (field, val) => {
    if (field === 'hotelId') {
      setForm(prev => ({
        ...prev,
        hotelId: val,
        materialId: '', // clear material selection
        materialName: '',
      }));
    } else {
      setForm(prev => ({ ...prev, [field]: val }));
    }
  };

  const handleFilterChange = (field, val) => {
    setFilters(prev => ({ ...prev, [field]: val }));
  };

  const handleClearFilters = () => {
    setFilters({
      hotelId: '',
      status: '',
    });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleEdit = item => {
    setForm({
      id: item.id,
      hotelId: item.hotel_id,
      materialId: item.material_id,
      materialName: item.material?.name || '',
      quantity: item.quantity,
      remark: item.remark,
      status: item.status,
      date: item.request_date
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!form.hotelId || !form.materialId || !form.quantity || !form.status) {
      Alert.alert('Errordd', 'Please fill all required fields');
      return;
    }
    const userId = 1;
    const payload = {
      id: form.id,
      hotel_id: form.hotelId,
      material_id: form.materialId,
      requested_by: userId,
      quantity: parseFloat(form.quantity),
      remark: form.remark,
      status: form.status,
      request_date: form.date,
    };
    console.log("form", form)
    try {
      let action;
      if (form?.id) {
        action = await dispatch(updateMaterial(payload));
      } else {
        action = await dispatch(addMaterial(payload));
      }

      if (action.payload) {
        Alert.alert('Success', form.id ? 'Request updated successfully' : 'Request added successfully');
        setModalVisible(false);
        dispatch(fetchAllMaterials());
      }
    } catch (error) {
      Alert.alert('Errord', error.message || 'Failed to save request');
    }
  };

  const handleDelete = id => {
    console.log('id', id);
    Alert.alert(
      'Delete Material',
      'Are you sure you want to delete this material?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              await dispatch(deleteMaterial(id));
              dispatch(fetchAllMaterials());
              Alert.alert('Success', 'Material deleted successfully');
            } catch (error) {
              console.error('Error deleting material:', error);
              Alert.alert('Error', 'Failed to delete material');
            }
          },
        },
      ],
      { cancelable: false },
    );
  };

  const renderMaterialItem = ({ item }) => {
    return (
      <View style={styles.materialItem}>
        <View style={styles.materialInfo}>
          <Text style={styles.materialName}>{item.material?.name || 'N/A'}</Text>
          <Text style={styles.materialDetails}>Hotel: {item.hotel?.name || 'N/A'}</Text>
          <Text style={styles.materialDetails}>
            Quantity: {item.quantity}
          </Text>
          <Text style={styles.materialDetails}>
            Requested: {item.request_date}
          </Text>
          <Text style={styles.materialDetails}>
            Remark: {item.remark}
          </Text>
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
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            style={styles.actionButton}
          >
            <Ionicons name="create-outline" size={22} color="#1c2f87" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={22} color="#fe8c06" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Replace filteredMaterialOptions to use allMaterials
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
      <TouchableOpacity
        style={[
          styles.dateInputContainer,
          errors.date && styles.inputError
        ]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateInput}>
          {form.date || 'Select Date'}
        </Text>
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
          maximumDate={new Date()} // Optional: restrict to past dates
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>List of Material</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={toggleFilters}
          >
            <Ionicons name="filter" size={24} color="#1c2f87" />
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
                reorderLevel: '',
                hotelId: '',
                category: '',
                status: '',
                date: new Date()?.toISOString()?.split('T')[0],
              });
              setModalVisible(true);
            }}
          >
            <Icon name="add" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Section - Only shown when showFilters is true */}
      {showFilters && (
        <View style={styles.filterContainer}>
          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <DropdownField
                label="Filter by Hotel"
                placeholder="Select hotel"
                value={filters.hotelId}
                onSelect={item => handleFilterChange('hotelId', item.value)}
                options={hotelOptions}
                disabled={hotelsLoading}
              />
            </View>
            <View style={styles.filterItem}>
              <DropdownField
                label="Filter by Status"
                placeholder="Select status"
                value={filters.status}
                onSelect={item => handleFilterChange('status', item.value)}
                options={statuses}
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={handleClearFilters}
          >
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {viewMode === 'list' ? (
        <FlatList
          data={filteredMaterials}
          keyExtractor={item => item?.id?.toString()}
          renderItem={renderMaterialItem}
          contentContainerStyle={styles.materialList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#1c2f87']}
            />
          }
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.tableScrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
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
            <Text style={styles.emptyText}>No material requests found.</Text>
          )}
        </ScrollView>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {form.id ? 'Edit Request' : 'Add Request'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1c2f87" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalContainer}>
              <DropdownField
                label="Hotel"
                placeholder="Select hotel"
                value={form.hotelId}
                onSelect={(item) => {
                  console.log('Hotel selected:', item);
                  handleChange('hotelId', item.value);
                  handleChange('materialId', ''); // Reset material selection
                  handleChange('materialName', ''); // Reset material name
                }}
                options={hotelOptions}
                disabled={hotelsLoading}
              />

              <DropdownField
                label="Material"
                placeholder="Select material"
                value={form.materialId}
                onSelect={item => {
                  handleChange('materialId', item.value);
                  handleChange('materialName', item.label); // Update both fields
                }}
                options={filteredMaterialOptions}
                disabled={!form.hotelId} // Disable if no hotel selected
              />

              <InputField
                label="Quantity"
                placeholder="Enter quantity"
                value={form.quantity}
                onChangeText={val => handleChange('quantity', val)}
                keyboardType="numeric"
              />

              <DropdownField
                label="Status"
                placeholder="Select status"
                value={form.status}
                onSelect={item => handleChange('status', item.value)}
                options={[
                  { label: 'Pending', value: 'pending' },
                  { label: 'Completed', value: 'completed' }
                ]}
              />

              {renderDateInput()}

              <InputField
                label="Remark"
                placeholder="Enter remark"
                value={form.remark}
                onChangeText={val => handleChange('remark', val)}
                multiline
              />

              <View style={styles.formBtnRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}
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
    </SafeAreaView>
  );
}

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
  dateField: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  dateFieldText: {
    color: '#333',
    fontSize: 16,
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
  },
  actionButton: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#f1f1f1',
  },
  errorText: {
    color: '#ff4d4d',
    textAlign: 'center',
    marginTop: 20,
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
  dropdownLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#333',
  },
  dropdownContainer: {
    marginBottom: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    marginRight: 12,
    padding: 4,
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
    paddingRight: 12, // Add padding for the icon
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
  // New styles for filters
  filterContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  filterItem: {
    flex: 1,
    marginRight: 10,
  },
  clearFiltersButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  clearFiltersText: {
    color: '#fe8c06',
    fontFamily: 'Poppins-SemiBold',
  },
});