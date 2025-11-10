import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../assets/globleStyles/colors';

const SearchComponent = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  resultsCount = null,
  showResults = true,
}) => {
  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons
          name="search"
          size={16}
          color="#6c757d"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor="#6c757d"
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={16} color="#6c757d" />
          </TouchableOpacity>
        )}
      </View>
      {showResults && value.length > 0 && resultsCount !== null && (
        <Text style={styles.searchResults}>
          {resultsCount} result{resultsCount !== 1 ? 's' : ''} found
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LightGray,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.veryLightBlue,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.LightGray,
    minHeight: 32,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.darkBlue,
    fontFamily: 'Poppins-Regular',
    paddingVertical: 1,
  },
  clearButton: {
    padding: 4,
  },
  searchResults: {
    fontSize: 12,
    color: Colors.gray,
    fontFamily: 'Poppins-Regular',
    marginTop: 8,
    marginLeft: 4,
  },
});

export default SearchComponent;

