import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../assets/globleStyles/colors';

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
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelect = (item) => {
    onSelect(item);
    setIsOpen(false);
  };

  const selectedOption = options.find(option => String(option.value) === String(value));
  const filteredOptions = options.filter(option =>
    option.label?.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.dropdown, error && styles.dropdownError]}
        onPress={() => {
          setSearchQuery('');
          setIsOpen(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.dropdownContent}>
          <Text style={[styles.dropdownText, !selectedOption && styles.placeholder]}>
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          <Ionicons 
            name={isOpen ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={Colors.darkBlue} 
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
                <Ionicons name="close" size={24} color={Colors.darkBlue} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color={Colors.darkBlue} style={styles.searchIcon} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search..."
                placeholderTextColor={Colors.gray}
                style={styles.searchInput}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIconWrap}>
                  <Ionicons name="close-circle" size={18} color={Colors.gray} />
                </TouchableOpacity>
              )}
            </View>
            
            {filteredOptions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No results</Text>
              </View>
            ) : (
              <FlatList
                data={filteredOptions}
                keyExtractor={(item) => item.value.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      String(value) === String(item.value) && styles.selectedOption
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={[
                      styles.optionText,
                      String(value) === String(item.value) && styles.selectedOptionText
                    ]}>
                      {item.label}
                    </Text>
                    {String(value) === String(item.value) && (
                      <Ionicons name="checkmark" size={20} color={Colors.orange} />
                    )}
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              />
            )}
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
    borderColor:'#ccc',
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  dropdownError: {
    borderColor: Colors.red,
    borderWidth: 2,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  dropdownText: {
    fontSize: 15,
    color: Colors.darkBlue,
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
  placeholder: {
    color: Colors.gray,
  },
  errorText: {
    color: Colors.red,
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
    backgroundColor: Colors.white,
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
    elevation: 10,
    shadowColor: Colors.black,
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
    borderBottomColor: Colors.LightGray,
  },
  dropdownTitle: {
    fontSize: 18,
    color: Colors.darkBlue,
    fontFamily: 'Poppins-Bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LightGray,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.LightGray,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 0,
    color: Colors.darkBlue,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    backgroundColor: Colors.white,
    textAlignVertical: 'center',
  },
  clearIconWrap: {
    marginLeft: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
    borderRadius: 12
  },
  selectedOption: {
    backgroundColor: '#f0f4ff',
  },
  optionText: {
    fontSize: 16,
    color: Colors.darkBlue,
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
  selectedOptionText: {
    fontFamily: 'Poppins-SemiBold',
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: 'Poppins-Regular',
  },
});
