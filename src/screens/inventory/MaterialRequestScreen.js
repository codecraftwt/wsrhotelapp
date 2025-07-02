import React, { useState } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Sample dropdown data
const hotels = ['Hotel A', 'Hotel B', 'Hotel C'];
const categories = ['Grocery', 'Vegetables', 'Meat', 'Beverages'];
const statusOptions = ['Select Status', 'Pending', 'Completed'];

// Temporary data
const mockMaterialRequests = [
  { id: 1, hotel: 'Hotel A', category: 'Grocery', materialName: 'Rice', unit: 'kg', reorderLevel: '10', remark: 'Basmati', date: '2024-06-01', status: 'Pending' },
  { id: 2, hotel: 'Hotel B', category: 'Vegetables', materialName: 'Tomato', unit: 'kg', reorderLevel: '5', remark: 'Fresh', date: '2024-06-02', status: 'Completed' },
];

// Validation rules
const VALIDATION_RULES = {
  hotel: { required: true },
  category: { required: true },
  materialName: { required: true, minLength: 2, maxLength: 100 },
  unit: { required: true, minLength: 1, maxLength: 20 },
  reorderLevel: { required: true, pattern: /^\d+$/ },
  remark: { required: true, minLength: 2, maxLength: 100 },
  date: { required: true },
  status: { required: true, not: 'Select Status' },
};

export default function MaterialRequestScreen() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    hotel: '',
    category: '',
    materialName: '',
    unit: '',
    reorderLevel: '',
    remark: '',
    date: '',
    status: 'Select Status',
  });
  const [materialRequests, setMaterialRequests] = useState(mockMaterialRequests);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    Object.keys(VALIDATION_RULES).forEach(field => {
      const value = form[field];
      const rules = VALIDATION_RULES[field];
      if (rules.required && (!value || value.trim() === '')) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        return;
      }
      if (rules.not && value === rules.not) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
      if (value && value.trim() !== '') {
        if (rules.minLength && value.length < rules.minLength) {
          newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rules.minLength} characters`;
        } else if (rules.maxLength && value.length > rules.maxLength) {
          newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be less than ${rules.maxLength} characters`;
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          if (field === 'reorderLevel') {
            newErrors[field] = 'Please enter a valid reorder level (numbers only)';
          }
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form field changes
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle date picker
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const d = selectedDate;
      const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      handleChange('date', formatted);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }
    const materialData = { ...form };
    if (editId) {
      setMaterialRequests(prev =>
        prev.map(request =>
          request.id === editId ? { ...request, ...materialData, id: editId } : request
        )
      );
    } else {
      setMaterialRequests(prev => [
        ...prev,
        {
          id: prev.length ? Math.max(...prev.map(r => r.id)) + 1 : 1,
          ...materialData,
        },
      ]);
    }
    closeForm();
  };

  // Handle edit
  const handleEdit = request => {
    setForm({ ...request });
    setEditId(request.id);
    setShowForm(true);
    setErrors({});
  };

  // Handle delete
  const handleDelete = id => {
    Alert.alert(
      'Delete Material Request',
      'Are you sure you want to delete this material request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setMaterialRequests(prev => prev.filter(r => r.id !== id)),
        },
      ],
    );
  };

  // Close form and reset state
  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setErrors({});
    setForm({
      hotel: '',
      category: '',
      materialName: '',
      unit: '',
      reorderLevel: '',
      remark: '',
      date: '',
      status: 'Select Status',
    });
  };

  // Render dropdown
  const renderDropdown = (field, label, options) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.dropdown, errors[field] && styles.inputError]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {options.map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.dropdownOption,
                form[field] === option && styles.dropdownOptionSelected,
              ]}
              onPress={() => handleChange(field, option)}
            >
              <Text style={[
                styles.dropdownOptionText,
                form[field] === option && styles.dropdownOptionTextSelected,
              ]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  // Render text input
  const renderInput = (field, label, placeholder, options = {}) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
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

  // Render date picker
  const renderDatePicker = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Date</Text>
      <TouchableOpacity
        style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, errors.date && styles.inputError]}
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Material Requests</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowForm(true)}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Material Requests List */}
      <FlatList
        data={materialRequests}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.requestCard}>
            <View style={styles.requestInfo}>
              <Text style={styles.requestTitle}>{item.materialName}</Text>
              <Text style={styles.requestDetails}>
                {item.hotel} • {item.category} • {item.unit} • Reorder: {item.reorderLevel}
              </Text>
              <Text style={styles.requestDescription}>{item.remark}</Text>
              <Text style={styles.requestDate}>Date: {item.date}</Text>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'Pending' ? '#ffc107' : item.status === 'Completed' ? '#28a745' : '#6c757d' }]}> 
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
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
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No material requests added yet.</Text>
        }
      />

      {/* Add/Edit Material Request Modal */}
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
                {editId ? 'Update Material Request' : 'Add New Material'}
              </Text>
              <TouchableOpacity onPress={closeForm}>
                <Ionicons name="close" size={24} color="#1c2f87" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Select Hotel */}
              {renderDropdown('hotel', 'Select Hotel', hotels)}
              {/* Category & Material Name Row */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>{renderDropdown('category', 'Select Category', categories)}</View>
                <View style={{ flex: 1 }}>{renderInput('materialName', 'Material Name', 'Enter material name')}</View>
              </View>
              {/* Unit & Reorder Level Row */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>{renderInput('unit', 'Unit', 'Enter unit')}</View>
                <View style={{ flex: 1 }}>{renderInput('reorderLevel', 'Reorder Level', 'Enter reorder level', { keyboardType: 'numeric' })}</View>
              </View>
              {/* Remark */}
              {renderInput('remark', 'Remark', 'Enter remark')}
              {/* Date & Status Row */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>{renderDatePicker()}</View>
                <View style={{ flex: 1 }}>{renderDropdown('status', 'Status', statusOptions)}</View>
              </View>
              {/* Form Action Buttons */}
              <View style={styles.formBtnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={closeForm}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                  <Text style={styles.submitBtnText}>
                    {editId ? 'Update' : 'Save'}
                  </Text>
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
  requestCard: {
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
  requestInfo: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 16,
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
  },
  requestDetails: {
    fontSize: 13,
    color: '#fe8c06',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  requestDescription: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  requestDate: {
    fontSize: 12,
    color: '#1c2f87',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
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
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#1c2f87',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  errorText: {
    color: '#dc3545',
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
    backgroundColor: '#fff',
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
    borderColor: '#e9ecef',
  },
  dropdownOptionSelected: {
    backgroundColor: '#1c2f87',
    borderColor: '#1c2f87',
  },
  dropdownOptionText: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'Poppins-Regular',
  },
  dropdownOptionTextSelected: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
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
});
