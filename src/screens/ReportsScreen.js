import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function ReportsScreen() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    hotel_id: '', report_type: '', from_date: '', to_date: ''
  });

  const handleChange = (f, val) => setFilters(prev => ({ ...prev, [f]: val }));

  const handleFetch = () => {
    // TODO: Fetch from get_reports.php?hotel_id=&type=&from_date=&to_date=
    console.log('Fetching reports:', filters);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('reports')}</Text>

      {['hotel_id', 'report_type', 'from_date', 'to_date'].map(f => (
        <TextInput
          key={f}
          placeholder={t(f)}
          value={filters[f]}
          style={styles.input}
          onChangeText={val => handleChange(f, val)}
        />
      ))}

      <TouchableOpacity style={styles.button} onPress={handleFetch}>
        <Text style={styles.buttonText}>{t('fetch_report')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1B3A8B', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 10, marginVertical: 6 },
  button: { backgroundColor: '#F36F21', padding: 14, borderRadius: 8, marginTop: 20 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' }
});
