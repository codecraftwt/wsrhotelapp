import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPaymentReports } from '../../redux/slices/reportsSlice';
import DropdownField from '../../components/DropdownField';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { fetchHotels } from '../../redux/slices/hotelSlice';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchPlatformModes } from '../../redux/slices/paymentLedgerSlice';
import { handleDownloadPdf } from '../../utils/handleDownloadPdf';

const PaymentReportScreen = () => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { paymentReports, paymentReportTotals, loading, error } = useSelector(
    state => state.reports,
  );
  const { hotels } = useSelector(state => state.hotel);
  const platformModes = useSelector(state => state.paymentLedger.platformModes);
  const [viewMode, setViewMode] = useState('card');
  const [refreshing, setRefreshing] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedPlatformMode, setSelectedPlatformMode] = useState(null);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  useEffect(() => {
    dispatch(fetchPaymentReports());
    dispatch(fetchHotels());
    dispatch(fetchPlatformModes());
  }, [dispatch]);

  console.log('platformModes', platformModes);

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchPaymentReports()).finally(() => setRefreshing(false));
  };

  const handleFromDateChange = (event, date) => {
    setShowFromDatePicker(false);
    if (date) setFromDate(date);
  };

  const handleToDateChange = (event, date) => {
    setShowToDatePicker(false);
    if (date) setToDate(date);
  };

  const applyFilters = () => {
    const params = {
      hotel_id: selectedHotel?.value || '',
      platform_id: selectedPlatformMode?.value || '',
      from_date: fromDate.toISOString().split('T')[0],
      to_date: toDate.toISOString().split('T')[0],
    };
    dispatch(fetchPaymentReports(params));
    setIsFilterModalVisible(false);
  };

  const clearFilters = () => {
    setSelectedHotel(null);
    setSelectedPlatformMode(null);
    setFromDate(new Date());
    setToDate(new Date());
    dispatch(fetchPaymentReports());
    setIsFilterModalVisible(false);
  };

  const renderCardItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.mode}</Text>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Hotel:</Text>
        <Text style={styles.cardValue}>{item.hotel_name}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Platform:</Text>
        <Text style={styles.cardValue}>{item.platform_name}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Credit:</Text>
        <Text style={[styles.cardValue, styles.amount]}>{item.total_credit}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Debit:</Text>
        <Text style={[styles.cardValue, styles.amount]}>{item.total_debit}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Balance:</Text>
        <Text style={[styles.cardValue, styles.amount]}>₹{item?.balance}</Text>
      </View>

    </View>
  );

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={styles.tableHeaderCell}>Hotel</Text>
      <Text style={styles.tableHeaderCell}>Platform </Text>
      <Text style={styles.tableHeaderCell}>Credit</Text>
      <Text style={styles.tableHeaderCell}>Debit</Text>
      <Text style={styles.tableHeaderCell}>Balance</Text>
    </View>
  );

  const renderTableRow = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{item.hotel_name || 'N/A'}</Text>
      <Text style={styles.tableCell}>{item.platform_name || '-'}</Text>
      <Text style={[styles.tableCell, styles.amount]}>₹{item.total_credit}</Text>
      <Text style={[styles.tableCell, styles.amount]}>₹{item.total_debit}</Text>
      <Text style={[styles.tableCell, styles.amount]}>₹{item.balance}</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1c2f87" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hotelOptions = hotels.map(hotel => ({
    value: hotel.id,
    label: hotel.name,
  }));

  const paymentModeOptions = platformModes.map(mode => ({
    value: mode.id,
    label: mode.name,
  }));

  const generateReportTable = () => {
    return `
    <table>
      <tr>
        <th>Hotel</th>
        <th>PLatform</th>
        <th>Credit (Cr)	</th>
        <th>Debit (Dr)</th>
        <th>Balance</th>
      </tr>
      ${paymentReports
        .map(
          item => `
        <tr>
          <td>${item.hotel_name || '-'}</td>
          <td>${item.platform_name || '-'}</td>
          <td>${item?.total_credit || '-'}</td>
          <td>${item?.total_debit || '-'}</td>
          <td>${item?.balance || '-'}</td>
        </tr>
      `,
        )
        .join('')}
      <tr class="total-row">
        <td colspan="2">Totals</td>
        <td>Total Credit: ${paymentReportTotals.total_credit || '0'}</td>
        <td>Total Debit: ${paymentReportTotals.total_debit || '0'}</td>
        <td>Balance: ${paymentReportTotals.balance || '0'}</td>
        <td></td>
      </tr>
    </table>
  `;
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payment Reports</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.downloadBtn}
            onPress={() =>
              handleDownloadPdf(generateReportTable, 'Payment Report')
            }
          >
            <Ionicons name="download" size={22} color="#1c2f87" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setIsFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={22} color="#1c2f87" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              setViewMode(prev => (prev === 'card' ? 'table' : 'card'))
            }
            style={styles.viewToggleBtn}
          >
            <Ionicons
              name={viewMode === 'card' ? 'grid-outline' : 'list-outline'}
              size={24}
              color="#1c2f87"
            />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Payment Reports</Text>
              <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1c2f87" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <DropdownField
                label="Hotel"
                placeholder="Select Hotel"
                value={selectedHotel?.value}
                options={hotelOptions}
                onSelect={setSelectedHotel}
              />

              <DropdownField
                label="Platform mode"
                placeholder="Select Platform"
                value={selectedPlatformMode?.value}
                options={paymentModeOptions}
                onSelect={setSelectedPlatformMode}
              />

              {/* <View style={styles.dateFilterContainer}>
                <Text style={styles.filterLabel}>From Date</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowFromDatePicker(true)}
                >
                  <Text>{fromDate.toLocaleDateString()}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#1c2f87" />
                </TouchableOpacity>
                {showFromDatePicker && (
                  <DateTimePicker
                    value={fromDate}
                    mode="date"
                    display="default"
                    onChange={handleFromDateChange}
                  />
                )}
              </View>

              <View style={styles.dateFilterContainer}>
                <Text style={styles.filterLabel}>To Date</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowToDatePicker(true)}
                >
                  <Text>{toDate.toLocaleDateString()}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#1c2f87" />
                </TouchableOpacity>
                {showToDatePicker && (
                  <DateTimePicker
                    value={toDate}
                    mode="date"
                    display="default"
                    onChange={handleToDateChange}
                    minimumDate={fromDate}
                  />
                )}
              </View> */}
            </ScrollView>

            <View style={styles.modalButtonRow}>
              <Pressable
                style={[styles.modalButton, styles.clearFilterButton]}
                onPress={clearFilters}
              >
                <Text style={styles.clearFilterButtonText}>Clear Filters</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.applyButton]}
                onPress={applyFilters}
              >
                <Text style={styles.modalButtonText}>Apply Filters</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {viewMode === 'card' ? (
        <FlatList
          data={paymentReports}
          keyExtractor={item => item?.id?.toString()}
          renderItem={renderCardItem}
          contentContainerStyle={styles.cardList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1c2f87']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No payment reports available</Text>
            </View>
          }
        />
      ) : (
        <ScrollView horizontal>
          <View style={styles.tableWrapper}>
            {renderTableHeader()}
            <FlatList
              data={paymentReports}
              keyExtractor={item => item?.id?.toString()}
              renderItem={renderTableRow}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#1c2f87']}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="document-text-outline"
                    size={50}
                    color="#ccc"
                  />
                  <Text style={styles.emptyText}>
                    No payment reports available
                  </Text>
                </View>
              }
            />
          </View>
        </ScrollView>
      )}

      <View style={styles.stickyTotalBar}>
        <View style={styles.row}>
          <Text style={styles.totalAmountLabel}>Total Credit</Text>
          <Text style={styles.totalAmountValue}>
            ₹{paymentReportTotals.total_credit}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.totalAmountLabel}>Total Debit</Text>
          <Text style={styles.totalAmountValue}>
            ₹{paymentReportTotals.total_debit}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.totalAmountLabel}>Balance</Text>
          <Text style={styles.totalAmountValue}>
            ₹{paymentReportTotals.balance}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const windowWidth = Dimensions.get('window').width;

// Use the same styles as your ReportsScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fb', // subtle app-like background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1c2f87',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 2,
    shadowColor: '#1c2f87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c2f87',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    padding: 2,
  },
  viewToggleButton: {
    padding: 8,
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: '#1c2f87',
  },
  dropdownContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  cardList: {
    paddingHorizontal: 8,
    paddingVertical: 16, // ensure last card is visible
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#1c2f87',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: windowWidth - 32,
    alignSelf: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1c2f87',
    marginBottom: 6,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'center',
  },
  cardLabel: {
    fontWeight: '600',
    color: '#495057',
    width: 110,
    fontSize: 14,
  },
  cardValue: {
    flex: 1,
    color: '#6c757d',
    fontSize: 14,
  },
  amount: {
    fontWeight: 'bold',
    color: '#fe8c06',
  },
  dateFilterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    marginBottom: 8,
    color: '#1c2f87',
    fontWeight: 'bold',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
  },
  tableWrapper: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 8,
    marginBottom: 16,
    paddingBottom: 8,
    minWidth: windowWidth - 32,
    elevation: 2,
    shadowColor: '#1c2f87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1c2f87',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  tableHeaderCell: {
    color: '#fff',
    fontWeight: 'bold',
    width: 150,
    textAlign: 'center',
    fontSize: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#e9ecef',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  tableCell: {
    width: 150,
    textAlign: 'center',
    color: '#495057',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#6c757d',
    fontSize: 16,
    marginTop: 10,
  },
  viewToggleBtn: {
    marginRight: 12,
    padding: 4,
  },
  filterBtn: {
    marginRight: 12,
    padding: 4,
    position: 'relative',
  },
  downloadBtn: {
    marginRight: 12,
    padding: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fe8c06',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '92%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'stretch',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1c2f87',
  },
  modalCloseBtn: {
    marginTop: 20,
    backgroundColor: '#1c2f87',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  applyButton: {
    backgroundColor: '#1c2f87',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  clearFilterButton: {
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 8,
  },
  clearFilterButtonText: {
    color: '#1c2f87',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c2f87',
    marginBottom: 12,
    marginLeft: 8,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  totalAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingVertical: 18,
    backgroundColor: '#fff',
    borderTopColor: '#1c2f87',
    borderTopWidth: 1,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    marginTop: 0,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  totalAmountLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c2f87',
  },
  totalAmountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fe8c06',
  },
  stickyTotalBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  stickyTotalBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingVertical: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  row: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PaymentReportScreen;
