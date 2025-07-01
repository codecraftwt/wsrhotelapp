import React from 'react';
import { Picker } from '@react-native-picker/picker';
import { View, Text, StyleSheet } from 'react-native';

export const DropdownField = ({ label, value, onValueChange, items }) => (
  <View style={styles.inputContainer}>
    {label && <Text style={styles.label}>{label}</Text>}
    <View style={styles.dropdown}>
      <Picker
        selectedValue={value}
        onValueChange={onValueChange}
        style={styles.picker}
      >
        <Picker.Item label={`Select ${label.toLowerCase()}`} value="" />
        {items.map((item, index) => (
          <Picker.Item key={index} label={item} value={item} />
        ))}
      </Picker>
    </View>
  </View>
);

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
  },
  picker: {
    height: 50,
    width: '100%',
  },
});
