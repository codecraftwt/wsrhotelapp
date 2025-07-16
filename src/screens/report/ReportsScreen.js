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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReports, setSelectedType } from '../../redux/slices/reportsSlice';
import DropdownField from '../../components/DropdownField';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { fetchHotels } from '../../redux/slices/hotelSlice';
import DateTimePicker from '@react-native-community/datetimepicker';

const ReportsScreen = () => {
  const dispatch = useDispatch();
  const { reports, loading, error, selectedType } = useSelector(
    state => state.reports,
  );
  const { hotels } = useSelector(state => state.hotel);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [refreshing, setRefreshing] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const [tempSelectedType, setTempSelectedType] = useState(selectedType);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  // Section component for reuse
  const Section = ({ title, data, type }) => (
    <View style={{ marginBottom: 32 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView>
        {viewMode === 'card' ? (
          <FlatList
            data={data}
            keyExtractor={item => item.id.toString()}
            renderItem={itemProps => renderCardItem({ ...itemProps, type })}
            contentContainerStyle={[styles.cardList, { paddingBottom: 120 }]} // Ensure last card is visible above sticky bar
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={50} color="#ccc" />
                <Text style={styles.emptyText}>No {title.toLowerCase()} available</Text>
              </View>
            }
          />
        ) : (
          <ScrollView horizontal>
            <View style={styles.tableWrapper}>
              {renderTableHeader(type)}
              <FlatList
                data={data}
                keyExtractor={item => item.id.toString()}
                renderItem={itemProps => renderTableRow({ ...itemProps, type })}
                contentContainerStyle={{ paddingBottom: 120 }} // Ensure last row is visible above sticky bar
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="document-text-outline" size={50} color="#ccc" />
                    <Text style={styles.emptyText}>No {title.toLowerCase()} available</Text>
                  </View>
                }
              />
            </View>
          </ScrollView>
        )}
      </ScrollView>
    </View>
  );

  useEffect(() => {
    if (isFilterModalVisible) {
      setTempSelectedType(selectedType);
    }
  }, [isFilterModalVisible]);

  useEffect(() => {
    dispatch(fetchReports());
    dispatch(fetchHotels());

  }, [dispatch]);

  useEffect(() => {
    if (isFilterModalVisible) {
      setTempSelectedType(selectedType);
    }
  }, [isFilterModalVisible]);

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchReports()).finally(() => setRefreshing(false));
  };


  const handleFromDateChange = (event, date) => {
    setShowFromDatePicker(false);
    if (date) {
      setFromDate(date);
    }
  };

  const handleToDateChange = (event, date) => {
    setShowToDatePicker(false);
    if (date) {
      setToDate(date);
    }
  };

  const applyFilters = () => {
    const params = {
      type: tempSelectedType,
      hotel_id: selectedHotel?.value || '',
      from_date: fromDate.toISOString().split('T')[0],
      to_date: toDate.toISOString().split('T')[0]
    };

    dispatch(fetchReports(params));
    dispatch(setSelectedType(tempSelectedType));
    setIsFilterModalVisible(false);
  };

  // --- Total Calculation for Sticky Bar ---
  const getCurrentTotal = () => {
    if (!reports) return 0;
    if (selectedType === 'all') {
      // Sum all sections
      let total = 0;
      if (reports.advances) total += reports.advances.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
      if (reports.expenses) total += reports.expenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
      if (reports.orders) total += reports.orders.reduce((sum, item) => sum + parseFloat(item.total_amount || 0), 0);
      return total;
    } else if (selectedType === 'advances' || selectedType === 'expenses') {
      return (reports[selectedType] || []).reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    } else if (selectedType === 'orders') {
      return (reports.orders || []).reduce((sum, item) => sum + parseFloat(item.total_amount || 0), 0);
    }
    return 0;
  };

  // --- Clear All Filters ---
  const clearFilters = () => {
    setSelectedHotel(null);
    setFromDate(new Date());
    setToDate(new Date());
    setTempSelectedType('all');
    dispatch(setSelectedType('all'));
    dispatch(fetchReports());
    setIsFilterModalVisible(false);
  };

  const getFilteredReports = () => {
    if (!reports) return [];
    switch (selectedType) {
      case 'advances':
        return reports.advances || [];
      case 'expenses':
        return reports.expenses || [];
      case 'orders':
        return reports.orders || [];
      default:
        return [];
    }
  };

  const reportTypeOptions = [
    { label: 'Advances', value: 'advances' },
    { label: 'Expenses', value: 'expenses' },
    { label: 'Orders', value: 'orders' },
  ];

  const hotelOptions = hotels.map(hotel => ({
    value: hotel.id,
    label: hotel.name,
  }));

  const handleReportTypeChange = item => {
    dispatch(setSelectedType(item.value));
  };

  // Update renderTableHeader and renderTableRow to accept type as argument
  const renderTableHeader = (typeOverride) => {
    const type = typeOverride || selectedType;
    const headers = {
      advances: ['Employee', 'Amount', 'Reason', 'Date'],
      expenses: ['Title', 'Amount', 'Payment Mode', 'Date'],
      orders: ['Platform', 'Total Amount', 'Received', 'Settlement Date'],
    };
    return (
      <View style={styles.tableHeader}>
        {headers[type]?.map((header, index) => (
          <Text key={index} style={styles.tableHeaderCell}>
            {header}
          </Text>
        ))}
      </View>
    );
  };

  const renderTableRow = ({ item, type: typeOverride }) => {
    const type = typeOverride || selectedType;
    return (
      <View style={styles.tableRow}>
        {type === 'advances' && (
          <>
            <Text style={styles.tableCell}>{item.employee.name}</Text>
            <Text style={[styles.tableCell, styles.amount]}>
              ₹{item.amount}
            </Text>
            <Text style={styles.tableCell}>{item.reason}</Text>
            <Text style={styles.tableCell}>{item.date}</Text>
          </>
        )}
        {type === 'expenses' && (
          <>
            <Text style={styles.tableCell}>{item.title}</Text>
            <Text style={[styles.tableCell, styles.amount]}>
              ₹{item.amount}
            </Text>
            <Text style={styles.tableCell}>{item.payment_mode}</Text>
            <Text style={styles.tableCell}>{item.expense_date}</Text>
          </>
        )}
        {type === 'orders' && (
          <>
            <Text style={styles.tableCell}>{item.platform}</Text>
            <Text style={[styles.tableCell, styles.amount]}>
              ₹{item.total_amount}
            </Text>
            <Text style={styles.tableCell}>₹{item.received_amount}</Text>
            <Text style={styles.tableCell}>{item.settlement_date}</Text>
          </>
        )}
      </View>
    );
  };

  // Update renderCardItem to accept type as argument
  const renderCardItem = ({ item, type: typeOverride }) => {
    const type = typeOverride || selectedType;
    return (
      <View style={styles.card}>
        {type === 'advances' && (
          <>
            <Text style={styles.cardTitle}>{item.employee.name}</Text>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Amount:</Text>
              <Text style={[styles.cardValue, styles.amount]}>
                ₹{item.amount}
              </Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Reason:</Text>
              <Text style={styles.cardValue}>{item.reason}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Date:</Text>
              <Text style={styles.cardValue}>{item.date}</Text>
            </View>
          </>
        )}
        {type === 'expenses' && (
          <>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Amount:</Text>
              <Text style={[styles.cardValue, styles.amount]}>
                ₹{item.amount}
              </Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Payment Mode:</Text>
              <Text style={styles.cardValue}>{item.payment_mode}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Date:</Text>
              <Text style={styles.cardValue}>{item.expense_date}</Text>
            </View>
          </>
        )}
        {type === 'orders' && (
          <>
            <Text style={styles.cardTitle}>{item.platform}</Text>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Total Amount:</Text>
              <Text style={[styles.cardValue, styles.amount]}>
                ₹{item.total_amount}
              </Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Received:</Text>
              <Text style={styles.cardValue}>₹{item.received_amount}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Settlement Date:</Text>
              <Text style={styles.cardValue}>{item.settlement_date}</Text>
            </View>
          </>
        )}
      </View>
    );
  };

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

  const dropdownOptions = [
    { label: 'Advances', value: 'advances' },
    { label: 'Expenses', value: 'expenses' },
    { label: 'Orders', value: 'orders' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setIsFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={22} color="#1c2f87" />
            {selectedType && <View style={styles.filterBadge} />}
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
              <Text style={styles.modalTitle}>Filter Reports</Text>
              <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1c2f87" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <DropdownField
                label="Report Type"
                placeholder="Select Type"
                value={tempSelectedType}
                options={reportTypeOptions}
                onSelect={item => setTempSelectedType(item.value)}
              />

              <DropdownField
                label="Hotel"
                placeholder="Select Hotel"
                value={selectedHotel?.value}
                options={hotelOptions}
                onSelect={setSelectedHotel}
              />

              <View style={styles.dateFilterContainer}>
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
              </View>
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

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1c2f87" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : reports && selectedType === 'all' ? (
        <ScrollView>
          <Section title="Advances" data={reports.advances || []} type="advances" />
          <Section title="Expenses" data={reports.expenses || []} type="expenses" />
          <Section title="Orders" data={reports.orders || []} type="orders" />
        </ScrollView>
      ) : (
        <Section title={selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} data={getFilteredReports()} type={selectedType} />
      )}
      {/* Sticky Total Bar */}
      <SafeAreaView style={styles.stickyTotalBarWrapper} edges={['bottom']}>
        <View style={styles.stickyTotalBar}>
          <Text style={styles.totalAmountLabel}>
            Total {selectedType === 'all' ? 'All' : selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}:
          </Text>
          <Text style={styles.totalAmountValue}>₹{getCurrentTotal().toFixed(2)}</Text>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
};

const windowWidth = Dimensions.get('window').width;

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
    paddingBottom: 120, // ensure last card is visible
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#1c2f87',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
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
    fontSize: 18,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingVertical: 18,
    backgroundColor: '#fff',
    borderTopColor: '#1c2f87',
    borderTopWidth: 1,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default ReportsScreen;
