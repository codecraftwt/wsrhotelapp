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
} from '../../redux/slices/materialSlice';
import { fetchHotels } from '../../redux/slices/hotelSlice';

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
            <Text style={[styles.tableHeaderCell, { width: 150 }]}>
              Material Name
            </Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>Category</Text>
            <Text style={[styles.tableHeaderCell, { width: 120 }]}>Quantity</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>Unit</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>Status</Text>
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
                <Text style={[styles.tableCell, { width: 100 }]}>
                  {item.category}
                </Text>
                <Text style={[styles.tableCell, { width: 120 }]}>
                  {item.reorder_level}
                </Text>
                <Text style={[styles.tableCell, { width: 100 }]}>
                  {item.unit}
                </Text>
                <View style={[styles.tableCell, { width: 100 }]}>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          item.status === 'Pending'
                            ? '#ffc107'
                            : item.status === 'Completed'
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

  const [form, setForm] = useState({
    id: null,
    materialName: '',
    quantity: '',
    unit: '',
    description: '',
    reorderLevel: '',
    hotelId: '',
    category: '',
    status: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [isModalVisible, setModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'table'

  useEffect(() => {
    dispatch(fetchAllMaterials());
    dispatch(fetchHotels());
  }, [dispatch]);

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

  const handleChange = (field, val) =>
    setForm(prev => ({ ...prev, [field]: val }));

  const handleEdit = item => {
    setForm({
      id: item.id,
      materialName: item.name,
      quantity: item.reorder_level,
      unit: item.unit,
      description: item.remark,
      reorderLevel: item.reorder_level,
      hotelId: item.hotel_id,
      category: item.category,
      status: item.status,
      date: item.Date
        ? item.Date.split('T')[0]
        : new Date().toISOString().split('T')[0],
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    const payload = {
      id: form.id,
      hotel_id: form.hotelId,
      name: form.materialName,
      category: form.category,
      unit: form.unit,
      reorder_level: form.reorderLevel,
      remark: form.description,
      Date: form.date,
      status: form.status,
    };

    try {
      let action;
      if (form.id) {
        action = await dispatch(updateMaterial(payload));
      } else {
        action = await dispatch(addMaterial(payload));
        dispatch(fetchAllMaterials());
      }
      if (action.payload?.message) {
        Alert.alert('Success', action.payload.message);
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
          date: new Date().toISOString().split('T')[0],
        });
        setModalVisible(false);
      } else {
        Alert.alert('Error', 'Failed to update material');
      }
    } catch (error) {
      console.error('Error submitting material:', error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
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
          <Text style={styles.materialName}>{item.name}</Text>
          <Text style={styles.materialDetails}>Category: {item.category}</Text>
          <Text style={styles.materialDetails}>
            Quantity: {item.reorder_level} {item.unit}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === 'Pending'
                    ? '#ffc107'
                    : item.status === 'Completed'
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>List of Material Requests</Text>
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
      {/* <ScrollView>
        {loading ? (
          <ActivityIndicator size="large" color="#1c2f87" />
        ) : error ? (
          <Text style={styles.errorText}>Error: {error}</Text>
        ) : ( */}
      {viewMode === 'list' ? (
        <FlatList
          data={materials}
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
            data={materials}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          {materials.length === 0 && (
            <Text style={styles.emptyText}>No material requests added yet.</Text>
          )}
        </ScrollView>
      )}
      {/* )} */}
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
                {form.id ? 'Edit Material' : 'Add Material'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1c2f87" />
              </TouchableOpacity>
            </View>
            <ScrollView
              contentContainerStyle={styles.modalContainer}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              <InputField
                label="Material Name"
                placeholder="Enter material name"
                value={form.materialName}
                onChangeText={val => handleChange('materialName', val)}
              />
              <InputField
                label="Quantity"
                placeholder="Enter quantity"
                value={form.reorderLevel}
                onChangeText={val => handleChange('reorderLevel', val)}
                keyboardType="numeric"
              />
              <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownLabel}>Unit</Text>
                <DropdownField
                  label="Unit"
                  placeholder="Select a unit"
                  value={form.unit}
                  onSelect={item => handleChange('unit', item.value)}
                  options={units}
                />
              </View>
              <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownLabel}>Category</Text>
                <DropdownField
                  label="Category"
                  placeholder="Select a category"
                  value={form.category}
                  onSelect={item => handleChange('category', item.value)}
                  options={categories}
                />
              </View>
              <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownLabel}>Hotel</Text>
                <DropdownField
                  key="hotel_id"
                  label="Select Hotel"
                  placeholder={
                    hotelsLoading ? 'Loading hotels...' : 'Choose a hotel'
                  }
                  value={form.hotelId}
                  options={hotelOptions}
                  onSelect={item => handleChange('hotelId', item.value)}
                  disabled={hotelsLoading}
                />
              </View>
              <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownLabel}>Status</Text>
                <DropdownField
                  label="Status"
                  placeholder="Select a status"
                  value={form.status}
                  onSelect={item => handleChange('status', item.value)}
                  options={statuses}
                />
              </View>
              <InputField
                label="Date"
                placeholder="Enter date"
                value={form.date}
                onChangeText={val => handleChange('date', val)}
              />
              <InputField
                label="Description"
                placeholder="Enter description"
                value={form.description}
                onChangeText={val => handleChange('description', val)}
                multiline
                numberOfLines={4}
                style={{
                  height: 100,
                  textAlignVertical: 'top',
                  padding: 16,
                }}
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
      {/* </ScrollView> */}
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
});
