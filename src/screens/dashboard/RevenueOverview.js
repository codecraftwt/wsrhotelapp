import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RevenueOverview = () => {
  return (
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
              <View style={[styles.chartBar, { height }]} />
              <Text style={styles.chartLabel}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.chartIndicator}>
          <View style={styles.indicatorItem}>
            <View
              style={[styles.indicatorColor, { backgroundColor: '#1c2f87' }]}
            />
            <Text style={styles.indicatorText}>This Week</Text>
          </View>
          <View style={styles.indicatorItem}>
            <View
              style={[styles.indicatorColor, { backgroundColor: '#fe8c06' }]}
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
  );
};

const CHART_HEIGHT = 180;

const styles = StyleSheet.create({
  revenueBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#1c2f87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginBottom: 25,
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
  timeFilter: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6c757d',
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

export default RevenueOverview;
