import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RecentBookings = ({ recentOrders }) => {
  return (
    <View style={styles.ordersBox}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Bookings</Text>
        <Text style={styles.viewAll}>View All</Text>
      </View>

      <View style={styles.tableHeaderRow}>
        <Text style={styles.tableHeader}>Platform</Text>
        <Text style={styles.tableHeader}>Hotel</Text>
        <Text style={styles.tableHeader}>Amount</Text>
        <Text style={styles.tableHeader}>Date</Text>
      </View>

      {recentOrders.map((order, idx) => (
        <View
          style={[
            styles.tableRow,
            idx % 2 === 0 ? styles.evenRow : styles.oddRow,
          ]}
          key={idx}
        >
          <Text style={styles.tableCell}>{order.platform}</Text>
          <Text style={styles.tableCell}>{order.hotel}</Text>
          <Text style={styles.tableCell}>{order.amount}</Text>
          <Text style={styles.tableCell}>{order.date}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  ordersBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#1c2f87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1c2f87',
  },
  viewAll: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#fe8c06',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingBottom: 12,
    marginBottom: 8,
  },
  tableHeader: {
    flex: 1,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
    color: '#1c2f87',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  evenRow: {
    backgroundColor: '#f8f9fa',
  },
  oddRow: {
    backgroundColor: '#fff',
  },
  tableCell: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#495057',
    textAlign: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});

export default RecentBookings;
