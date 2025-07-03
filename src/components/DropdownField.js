import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function DropdownField({
  label,
  placeholder,
  value,
  options,
  onSelect,
  error,
  style,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (item) => {
    onSelect(item);
    setIsOpen(false);
  };

  const selectedOption = options.find(option => option.value === value);

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.dropdown, error && styles.dropdownError]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <View style={styles.dropdownContent}>
          <Text style={[styles.dropdownText, !selectedOption && styles.placeholder]}>
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          <Ionicons 
            name={isOpen ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#1c2f87" 
          />
        </View>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.dropdownModal}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color="#1c2f87" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={options}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    value === item.value && styles.selectedOption
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={[
                    styles.optionText,
                    value === item.value && styles.selectedOptionText
                  ]}>
                    {item.label}
                  </Text>
                  {value === item.value && (
                    <Ionicons name="checkmark" size={20} color="#fe8c06" />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dropdownError: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  dropdownText: {
    fontSize: 15,
    color: '#1c2f87',
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
  placeholder: {
    color: '#a0a3bd',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginTop: 4,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  dropdownTitle: {
    fontSize: 18,
    color: '#1c2f87',
    fontFamily: 'Poppins-Bold',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  selectedOption: {
    backgroundColor: '#f0f4ff',
  },
  optionText: {
    fontSize: 16,
    color: '#1c2f87',
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
  selectedOptionText: {
    fontFamily: 'Poppins-SemiBold',
  },
});
