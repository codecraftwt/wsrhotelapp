import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

export const InputField = ({
  label,
  placeholder,
  placeholderTextColor = '#999', // Default placeholder color
  value,
  onChangeText,
  style,
  error,
  ...props
}) => (
  <View style={styles.inputContainer}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput
      style={[styles.input, error && styles.inputError, style]} // Merge default and custom styles
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      value={value}
      onChangeText={onChangeText}
      {...props}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
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
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginTop: 4,
    marginLeft: 4,
  },
});
