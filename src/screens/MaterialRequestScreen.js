import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Picker, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function MaterialRequestScreen() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    hotel_id: '', category: '', material_id: '', quantity: '', unit: '', remark: ''
  });

  const handleChange = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const handleSubmit = () => {
    // TODO: Submit to /submit_material_request.php
    console.log('Material requested:', form);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('material_request')}</Text>

      {['hotel_id', 'material_id', 'quantity', 'unit', 'remark'].map(f => (
        <TextInput
          key={f}
          placeholder={t(f)}
          value={form[f]}
          style={styles.input}
          onChangeText={val => handleChange(f, val)}
        />
      ))}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{t('submit')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1B3A8B', marginBottom: 16 },
  input: {
    borderWidth: 1, borderColor: '#CCC', borderRadius: 8,
    padding: 10, marginVertical: 6
  },
  button: {
    backgroundColor: '#F36F21', padding: 14, borderRadius: 8, marginTop: 20
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' }
});
