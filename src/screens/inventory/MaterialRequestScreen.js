import React, { useState } from 'react';
import { View, Text, Picker, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { InputField } from '../../components/InputField';
import { DropdownField } from '../../components/DropdownField';
import { PrimaryButton } from '../../components/PrimaryButton';

export default function MaterialRequestScreen() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    materialName: '',
    quantity: '',
    unit: '',
    supplier: '',
    estimatedCost: '',
    description: '',
  });

  // Sample data for dropdowns
  const units = ['kg', 'g', 'lb', 'piece', 'liter', 'ml'];
  const suppliers = ['Supplier A', 'Supplier B', 'Supplier C', 'Supplier D'];

  const handleChange = (field, val) =>
    setForm(prev => ({ ...prev, [field]: val }));

  const handleSubmit = () => {
    console.log('Material requested:', form);
    // TODO: Submit to your API endpoint
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Material Request</Text>

      <InputField
        label="Material Name"
        placeholder="Enter material name"
        value={form.materialName}
        onChangeText={val => handleChange('materialName', val)}
      />

      <InputField
        label="Quantity"
        placeholder="Enter quantity"
        value={form.quantity}
        onChangeText={val => handleChange('quantity', val)}
        keyboardType="numeric"
      />

      <DropdownField
        label="Unit"
        value={form.unit}
        onValueChange={val => handleChange('unit', val)}
        items={units}
      />

      <DropdownField
        label="Supplier"
        value={form.supplier}
        onValueChange={val => handleChange('supplier', val)}
        items={suppliers}
      />

      <InputField
        label="Estimated Cost"
        placeholder="Enter estimated cost"
        value={form.estimatedCost}
        onChangeText={val => handleChange('estimatedCost', val)}
        keyboardType="numeric"
      />

      <InputField
        label="Description"
        placeholder="Enter description"
        placeholderTextColor="#666"
        value={form.description}
        onChangeText={val => handleChange('description', val)}
        multiline
        numberOfLines={4}
        style={{
          height: 100,
          textAlignVertical: 'top',
          padding: 16,
        }}
      />

      <PrimaryButton title="Submit" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B3A8B',
    marginBottom: 24,
    textAlign: 'center',
  },
});
