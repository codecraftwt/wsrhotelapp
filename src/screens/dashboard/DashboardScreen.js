import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import HotelPerformance from './HotelPerformance';
import RevenueOverview from './RevenueOverview';
import RecentBookings from './RecentBookings';

const DashboardScreen = () => {
  const { user } = useSelector(state => state.auth);

  // Summary cards data
  const summaryCards = [
    {
      label: 'Total Bookings',
      value: '128',
      icon: 'hotel',
      bg: '#f3f4fa',
      color: '#1c2f87',
    },
    {
      label: 'Occupancy Rate',
      value: '78%',
      icon: 'trending-up',
      bg: '#e6f7ff',
      color: '#1890ff',
    },
    {
      label: 'Revenue',
      value: '₹1.2L',
      icon: 'monetization-on',
      bg: '#f6ffed',
      color: '#52c41a',
    },
    {
      label: 'Pending Tasks',
      value: '12',
      icon: 'assignment',
      bg: '#fff7e6',
      color: '#fa8c16',
    },
  ];

  // Recent orders data
  const recentOrders = [
    {
      platform: 'MakeMyTrip',
      hotel: 'Grand Plaza',
      amount: '₹12,500',
      date: '12 Oct',
    },
    {
      platform: 'Booking.com',
      hotel: 'Sea View',
      amount: '₹8,750',
      date: '11 Oct',
    },
    {
      platform: 'Agoda',
      hotel: 'Mountain Resort',
      amount: '₹15,200',
      date: '10 Oct',
    },
    {
      platform: 'Direct',
      hotel: 'City Central',
      amount: '₹9,300',
      date: '9 Oct',
    },
    {
      platform: 'Expedia',
      hotel: 'Lakeside Inn',
      amount: '₹11,400',
      date: '8 Oct',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>
            Welcome back, {user.username}!
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Here's your hotel performance overview
          </Text>
        </View>

        {/* Hotel Performance */}
        <HotelPerformance summaryCards={summaryCards} />

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Revenue Overview */}
          <RevenueOverview />

          {/* Recent Bookings */}
          <RecentBookings recentOrders={recentOrders} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 8,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  welcomeContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  welcomeTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-SemiBold',
    color: '#1c2f87',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#6c757d',
  },
  mainContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});

export default DashboardScreen;
