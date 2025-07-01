// DashboardScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

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

        {/* Summary Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hotel Performance</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.cardsContainer}
          >
            {summaryCards.map((card, idx) => (
              <View
                key={card.label}
                style={[
                  styles.card,
                  {
                    backgroundColor: card.bg,
                    marginLeft: idx === 0 ? 0 : 16,
                  },
                ]}
              >
                <View style={styles.cardIconContainer}>
                  <Icon name={card.icon} size={24} color={card.color} />
                </View>
                <Text style={[styles.cardValue, { color: card.color }]}>
                  {card.value}
                </Text>
                <Text style={[styles.cardLabel, { color: card.color }]}>
                  {card.label}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Recent Orders */}
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

          {/* Revenue Overview */}
          <View style={styles.revenueBox}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Revenue Overview</Text>
              <Text style={styles.timeFilter}>Monthly</Text>
            </View>

            <View style={styles.revenueChartContainer}>
              {/* Chart bars */}
              <View style={styles.barChart}>
                {[60, 80, 120, 100, 90, 140, 110].map((height, index) => (
                  <View key={index} style={styles.chartBarContainer}>
                    <View style={[styles.chartBar, { height: height }]} />
                    <Text style={styles.chartLabel}>
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.chartIndicator}>
                <View style={styles.indicatorItem}>
                  <View
                    style={[
                      styles.indicatorColor,
                      { backgroundColor: '#1c2f87' },
                    ]}
                  />
                  <Text style={styles.indicatorText}>This Week</Text>
                </View>
                <View style={styles.indicatorItem}>
                  <View
                    style={[
                      styles.indicatorColor,
                      { backgroundColor: '#fe8c06' },
                    ]}
                  />
                  <Text style={styles.indicatorText}>Last Week</Text>
                </View>
              </View>
            </View>

            <View style={styles.revenueStats}>
              <View style={styles.revenueStatItem}>
                <Text style={styles.revenueStatLabel}>Total Revenue</Text>
                <Text style={styles.revenueStatValue}>₹1,20,540</Text>
              </View>
              <View style={styles.revenueStatItem}>
                <Text style={styles.revenueStatLabel}>Avg. Daily</Text>
                <Text style={styles.revenueStatValue}>₹8,609</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const CARD_WIDTH = width * 0.6;
const CHART_HEIGHT = 180;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 8,
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
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
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
  timeFilter: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6c757d',
  },
  cardsContainer: {
    marginTop: 12,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginBottom: 5,
  },
  cardIconContainer: {
    backgroundColor: 'rgba(28,47,135,0.1)',
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    opacity: 0.85,
  },
  mainContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
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
    fontSize: 14,
    color: '#1c2f87',
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
    fontSize: 14,
    color: '#495057',
  },
  revenueBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#1c2f87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  revenueChartContainer: {
    marginBottom: 20,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingBottom: 10,
  },
  chartBarContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  chartBar: {
    width: 20,
    backgroundColor: '#1c2f87',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  chartLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6c757d',
    marginTop: 8,
  },
  chartIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  indicatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  indicatorColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  indicatorText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#495057',
  },
  revenueStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  revenueStatItem: {
    alignItems: 'center',
  },
  revenueStatLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6c757d',
    marginBottom: 4,
  },
  revenueStatValue: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#1c2f87',
  },
});

export default DashboardScreen;
