import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEmployees,
  addEmployee,
  deleteEmployee,
  updateEmployee,
} from '../../redux/slices/employeeSlice'; // Adjust path

export default function AddEmployeeScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { employees, loading } = useSelector(state => state.employee);

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    altMobile: '',
    hotel: '',
    role: '',
    salary: '',
    joinDate: '',
    address: '',
    landmark: '',
    city: '',
    taluka: '',
    district: '',
    state: '',
    pincode: '',
    documents: [],
  });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, []);

  const handleChange = (field, value) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!form.name || !form.mobile || !form.role) {
      Alert.alert('Validation', 'Name, Mobile, and Role are required.');
      return;
    }

    if (editId) {
      dispatch(updateEmployee({ ...form, id: editId }));
    } else {
      dispatch(addEmployee(form));
    }

    closeForm();
  };

  const handleEdit = emp => {
    setForm({ ...emp });
    setEditId(emp.id);
    setShowForm(true);
  };

  const handleDelete = id => {
    Alert.alert('Delete', 'Are you sure you want to delete this employee?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => dispatch(deleteEmployee(id)),
      },
    ]);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm({
      name: '',
      mobile: '',
      altMobile: '',
      hotel: '',
      role: '',
      salary: '',
      joinDate: '',
      address: '',
      landmark: '',
      city: '',
      taluka: '',
      district: '',
      state: '',
      pincode: '',
      documents: [],
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f8fa' }}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>{t('List of Employees')}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowForm(true)}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={employees}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        refreshing={loading}
        onRefresh={() => dispatch(fetchEmployees())}
        renderItem={({ item }) => (
          <View style={styles.employeeCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.empName}>{item.name}</Text>
              <Text style={styles.empRole}>{item.role}</Text>
              <Text style={styles.empMobile}>{item.mobile}</Text>
            </View>
            <View style={styles.iconRow}>
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
          <Text style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>
            {t('No employees added yet.')}
          </Text>
        }
      />

      {/* Add/Edit Employee Modal */}
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
                {editId ? t('Update Employee') : t('Add Employee')}
              </Text>
              <TouchableOpacity onPress={closeForm}>
                <Ionicons name="close" size={24} color="#1c2f87" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.section}>Personal Details</Text>
              <TextInput
                placeholder={t('Name')}
                style={styles.input}
                onChangeText={text => handleChange('name', text)}
                value={form.name}
              />
              <TextInput
                placeholder={t('Mobile Number')}
                style={styles.input}
                keyboardType="phone-pad"
                onChangeText={text => handleChange('mobile', text)}
                value={form.mobile}
              />
              <TextInput
                placeholder={t('Alternate Mobile Number')}
                style={styles.input}
                keyboardType="phone-pad"
                onChangeText={text => handleChange('altMobile', text)}
                value={form.altMobile}
              />
              <TextInput
                placeholder={t('Role')}
                style={styles.input}
                onChangeText={text => handleChange('role', text)}
                value={form.role}
              />
              <TextInput
                placeholder={t('Salary')}
                style={styles.input}
                keyboardType="numeric"
                onChangeText={text => handleChange('salary', text)}
                value={form.salary}
              />
              <TextInput
                placeholder={t('Join Date')}
                style={styles.input}
                onChangeText={text => handleChange('joinDate', text)}
                value={form.joinDate}
              />
              <TextInput
                placeholder={t('Hotel')}
                style={styles.input}
                onChangeText={text => handleChange('hotel', text)}
                value={form.hotel}
              />
              <Text style={styles.section}>Address</Text>
              <TextInput
                placeholder={t('Address')}
                style={styles.input}
                onChangeText={text => handleChange('address', text)}
                value={form.address}
              />
              <TextInput
                placeholder={t('Landmark')}
                style={styles.input}
                onChangeText={text => handleChange('landmark', text)}
                value={form.landmark}
              />
              <TextInput
                placeholder={t('City')}
                style={styles.input}
                onChangeText={text => handleChange('city', text)}
                value={form.city}
              />
              <TextInput
                placeholder={t('Taluka')}
                style={styles.input}
                onChangeText={text => handleChange('taluka', text)}
                value={form.taluka}
              />
              <TextInput
                placeholder={t('District')}
                style={styles.input}
                onChangeText={text => handleChange('district', text)}
                value={form.district}
              />
              <TextInput
                placeholder={t('State')}
                style={styles.input}
                onChangeText={text => handleChange('state', text)}
                value={form.state}
              />
              <TextInput
                placeholder={t('Pincode')}
                style={styles.input}
                keyboardType="numeric"
                onChangeText={text => handleChange('pincode', text)}
                value={form.pincode}
              />
              <Text style={styles.section}>{t('Upload Profile Image')}</Text>
              <TouchableOpacity style={styles.uploadBtn}>
                <Text style={styles.uploadText}>{t('Choose Files')}</Text>
              </TouchableOpacity>
              <View style={styles.formBtnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={closeForm}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>
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
  employeeCard: {
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
  empName: {
    fontSize: 16,
    color: '#1c2f87',
    fontFamily: 'Poppins-SemiBold',
  },
  empRole: {
    fontSize: 13,
    color: '#fe8c06',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  empMobile: {
    fontSize: 13,
    color: '#888',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  iconBtn: {
    marginLeft: 8,
    padding: 4,
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
    maxHeight: '100%',
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
    padding: 10,
    marginVertical: 6,
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#1c2f87',
  },
  uploadBtn: {
    backgroundColor: '#EFEFEF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadText: {
    color: '#1c2f87',
    fontWeight: '600',
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
  button: {
    backgroundColor: '#fe8c06',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
});
