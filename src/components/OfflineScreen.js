// src/components/OfflineScreen.js
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const OfflineScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>You are currently offline.</Text>
      <Text style={styles.subText}>Please check your internet connection.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ff4d4d',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  text: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default OfflineScreen;
