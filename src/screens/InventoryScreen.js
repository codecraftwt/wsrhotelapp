import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

const dummyInventory = [
  { name: 'Milk', qty: 5, unit: 'L', low: false },
  { name: 'Chicken', qty: 2, unit: 'Kg', low: true }
];

export default function InventoryScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('inventory')}</Text>
      <FlatList
        data={dummyInventory}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={[styles.row, item.low && styles.lowStock]}>
            <Text>{item.name}</Text>
            <Text>{item.qty} {item.unit}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1B3A8B', marginBottom: 12 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: 12, borderBottomWidth: 1, borderBottomColor: '#EEE'
  },
  lowStock: { backgroundColor: '#FFF1F0' }
});
