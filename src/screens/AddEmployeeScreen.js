import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function AddEmployeeScreen() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '', mobile: '', altMobile: '', hotel: '', role: '',
    salary: '', joinDate: '', address: '', landmark: '', city: '',
    taluka: '', district: '', state: '', pincode: '', documents: [],
  });

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    // TODO: Replace with API call to /add_employee.php
    console.log('Submitted:', form);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('add_employee')}</Text>

      {['name', 'mobile', 'altMobile', 'salary', 'joinDate', 'role', 'hotel'].map((f, i) => (
        <TextInput
          key={i}
          placeholder={t(f)}
          style={styles.input}
          onChangeText={(text) => handleChange(f, text)}
          value={form[f]}
        />
      ))}

      {/* Address fields */}
      {['address', 'landmark', 'city', 'taluka', 'district', 'state', 'pincode'].map((f, i) => (
        <TextInput
          key={f}
          placeholder={t(f)}
          style={styles.input}
          onChangeText={(text) => handleChange(f, text)}
          value={form[f]}
        />
      ))}

      <Text style={styles.section}>{t('upload_documents')}</Text>
      <TouchableOpacity style={styles.uploadBtn}>
        <Text style={styles.uploadText}>{t('choose_files')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{t('submit')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1B3A8B', marginBottom: 15 },
  input: {
    borderWidth: 1, borderColor: '#CCC', borderRadius: 8,
    padding: 10, marginVertical: 6,
  },
  section: { marginTop: 20, marginBottom: 10, fontWeight: '600' },
  uploadBtn: {
    backgroundColor: '#EFEFEF', padding: 12, borderRadius: 8,
    alignItems: 'center', marginBottom: 20
  },
  uploadText: { color: '#1B3A8B', fontWeight: '600' },
  button: {
    backgroundColor: '#F36F21', padding: 14,
    borderRadius: 8, marginBottom: 40
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' }
});
