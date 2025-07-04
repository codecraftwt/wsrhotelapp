import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

export const InputField = ({
  label,
  placeholder,
  placeholderTextColor = '#999', // Default placeholder color
  value,
  onChangeText,
  style,
  ...props
}) => (
  <View style={styles.inputContainer}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput
      style={[styles.input, style]} // Merge default and custom styles
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      value={value}
      onChangeText={onChangeText}
      {...props}
    />
  </View>
);

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});
