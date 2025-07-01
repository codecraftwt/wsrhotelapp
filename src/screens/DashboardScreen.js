import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function DashboardScreen({ navigation }) {
  const { t } = useTranslation();

  const buttons = [
    { title: t('add_employee'), route: 'AddEmployee' },
    { title: t('advance_entry'), route: 'AdvanceEntry' },
    { title: t('material_request'), route: 'MaterialRequest' },
    { title: t('expenses'), route: 'ExpenseEntry' },
    { title: t('inventory'), route: 'Inventory' },
    { title: t('reports'), route: 'Reports' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('dashboard')}</Text>
      {buttons.map((btn, index) => (
        <TouchableOpacity key={index} style={styles.card} onPress={() => navigation.navigate(btn.route)}>
          <Text style={styles.cardText}>{btn.title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1B3A8B', marginBottom: 20 },
  card: {
    backgroundColor: '#F36F21',
    padding: 20,
    borderRadius: 10,
    marginVertical: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2
  },
  cardText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});
