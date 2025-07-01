import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function AdvanceEntryScreen() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    hotel_id: '', employee_id: '', amount: '', reason: '', date: ''
  });

  const handleChange = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const handleSubmit = () => {
    // TODO: API call to /advance_entry.php
    console.log('Advance submitted:', form);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('advance_entry')}</Text>

      {['hotel_id', 'employee_id', 'amount', 'reason', 'date'].map(f => (
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
