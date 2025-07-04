import React from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const numColumns = 2;
const { width } = Dimensions.get('window');
const HORIZONTAL_GAP = 32; // More horizontal space between cards
const VERTICAL_GAP = 16; // Vertical space between rows
const CARD_WIDTH =
  ((width - HORIZONTAL_GAP * (numColumns + 1)) / numColumns) * 1;

const HotelPerformance = ({ summaryCards }) => {
  const renderItem = ({ item, index }) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: item.bg,
          marginLeft: index % numColumns === 0 ? 0 : HORIZONTAL_GAP,
          marginTop: VERTICAL_GAP,
          width: CARD_WIDTH,
        },
      ]}
    >
      <View style={styles.cardIconContainer}>
        <Icon name={item.icon} size={24} color={item.color} />
      </View>
      <Text style={[styles.cardValue, { color: item.color }]}>
        {item.value}
      </Text>
      <Text style={[styles.cardLabel, { color: item.color }]}>
        {item.label}
      </Text>
    </View>
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Hotel Performance</Text>
      <FlatList
        data={summaryCards}
        renderItem={renderItem}
        keyExtractor={item => item.label}
        numColumns={numColumns}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: HORIZONTAL_GAP,
          paddingBottom: 24,
          justifyContent: 'center',
        }}
        columnWrapperStyle={{
          justifyContent: 'center',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1c2f87',
    paddingHorizontal: HORIZONTAL_GAP,
  },
  card: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardIconContainer: {
    backgroundColor: 'rgba(28,47,135,0.1)',
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    marginBottom: 2,
  },
  cardLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    opacity: 0.85,
  },
});

export default HotelPerformance;
