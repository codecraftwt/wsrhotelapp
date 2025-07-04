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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { InputField } from '../../components/InputField';
import { DropdownField } from '../../components/DropdownField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import MaterialIcons
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  fetchAllMaterials,
  addMaterial,
  updateMaterial,
  deleteMaterial,
} from '../../redux/slices/materialSlice';

export default function MaterialRequestScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { materials, loading, error } = useSelector(state => state.material);

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

  const units = ['kg', 'g', 'lb', 'piece', 'liter', 'ml'];
  const categories = ['veg', 'non-veg', 'dairy'];

  useEffect(() => {
    dispatch(fetchAllMaterials());
  }, [dispatch]);

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
      date: item.Date ? item.Date.split('T')[0] : new Date().toISOString().split('T')[0],
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
              date: new Date().toISOString().split('T')[0],
            });
            setModalVisible(true); 
          }}
        >
          <Icon name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView>
        {loading ? (
          <ActivityIndicator size="large" color="#1c2f87" />
        ) : error ? (
          <Text style={styles.errorText}>Error: {error}</Text>
        ) : (
          <FlatList
            data={materials}
            keyExtractor={item => item.id.toString()}
            renderItem={renderMaterialItem}
            contentContainerStyle={styles.materialList}
          />
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
                <DropdownField
                  label="Unit"
                  value={form.unit}
                  onValueChange={val => handleChange('unit', val)}
                  items={units}
                />
                <DropdownField
                  label="Category"
                  value={form.category}
                  onValueChange={val => handleChange('category', val)}
                  items={categories}
                />
                <InputField
                  label="Hotel ID"
                  placeholder="Enter hotel ID"
                  value={form.hotelId}
                  onChangeText={val => handleChange('hotelId', val)}
                  keyboardType="numeric"
                />
                <DropdownField
                  label="Status"
                  value={form.status}
                  onValueChange={val => handleChange('status', val)}
                  items={['Completed', 'Pending', 'In Progress']}
                />
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
      </ScrollView>
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
    marginBottom:40,
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
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
});
