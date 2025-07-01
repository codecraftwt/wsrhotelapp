import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function ExpenseEntryScreen() {
  const { t } = useTranslation();
  const [expense, setExpense] = useState({
    hotel_id: '', title: '', amount: '', payment_mode: '',
    expense_date: '', notes: ''
  });

  const handleChange = (f, val) => setExpense(prev => ({ ...prev, [f]: val }));

  const handleSubmit = () => {
    // TODO: POST to /add_expense.php
    console.log('Expense added:', expense);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('expenses')}</Text>
      {['hotel_id', 'title', 'amount', 'payment_mode', 'expense_date', 'notes'].map(f => (
        <TextInput
          key={f}
          placeholder={t(f)}
          value={expense[f]}
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
