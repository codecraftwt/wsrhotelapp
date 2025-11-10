'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { fetchAdvanceReports } from '../../redux/slices/reportsSlice';
import DropdownField from '../../components/DropdownField';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { fetchHotels } from '../../redux/slices/hotelSlice';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchEmployees } from '../../redux/slices/employeeSlice';
import { handleDownloadPdf } from '../../utils/handleDownloadPdf';
import CalendarModal from '../../components/CalendarModal';
import { Colors } from '../../assets/globleStyles/colors';

const AdvanceReportScreen = () => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const {
    advanceReports,
    advanceReportTotals,
    loading,
    error,
    hasMore,
    currentPage,
    perPage,
    totalItems,
  } = useSelector(state => state.reports);

  console.log('advanceReportTotals', advanceReportTotals);

  const { hotels } = useSelector(state => state.hotel);
  const { employees } = useSelector(state => state.employee);
  console.log(' fetch dropdown employees ---------->', employees);

  // Ensure all employees are fetched for the dropdown
  useEffect(() => {
    // Always fetch all employees when component mounts
    dispatch(fetchEmployees({ page: 1, per_page: 1000 })); // Fetch all employees
    console.log('Dispatching fetchEmployees...');
  }, [dispatch]);

  // Refetch employees when filter modal opens to ensure we have all data
  useEffect(() => {
    if (isFilterModalVisible) {
      dispatch(fetchEmployees({ page: 1, per_page: 1000 }));
      console.log('Filter modal opened - refetching all employees');
    }
  }, [isFilterModalVisible, dispatch]);

  // Pagination state
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const perPageSize = 10; // Number of items per page

  const [viewMode, setViewMode] = useState('card');
  const [refreshing, setRefreshing] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedType, setSelectedType] = useState(null); // Credit or Debit

  // FIX: Set default date range to last 30 days instead of just today
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);

  // Initial load - FIX: Don't send date filters initially to get all data
  useEffect(() => {
    console.log(
      '🚀 Initial load - fetching advance reports without date filters',
    );
    dispatch(fetchAdvanceReports({ page: 1, per_page: perPageSize }));
    dispatch(fetchHotels());
    // dispatch(fetchEmployees());
  }, [dispatch]);

  // Debug effect to track state changes
  useEffect(() => {
    console.log('📊 Advance Reports State updated:', {
      reportsCount: advanceReports.length,
      currentPage,
      hasMore,
      loading,
      isLoadingMore,
      totalItems,
    });
  }, [
    advanceReports.length,
    currentPage,
    hasMore,
    loading,
    isLoadingMore,
    totalItems,
  ]);

  const handleLoadMore = useCallback(() => {
    console.log('🔍 Advance Reports Load more check:', {
      isLoadingMore,
      hasMore,
      loading,
      refreshing,
      currentPage,
      itemsCount: advanceReports.length,
    });

    if (!isLoadingMore && hasMore && !loading && !refreshing) {
      console.log('✅ Conditions met - fetching page:', currentPage + 1);
      setIsLoadingMore(true);

      // FIX: Only send date filters if they are actually selected in filters
      const params = {
        hotel_id: selectedHotel?.value || '',
        employee_id: selectedEmployee?.value || '',
        type: selectedType?.value || '',
        page: currentPage + 1,
        per_page: perPageSize,
      };

      // Only add date filters if user has applied filters
      // if (selectedHotel || selectedEmployee) {
      //   params.from_date = fromDate.toISOString().split("T")[0]
      //   params.to_date = toDate.toISOString().split("T")[0]
      // }
      if (fromDate) {
        params.from_date = fromDate.toISOString().split('T')[0];
      }
      if (toDate) {
        params.to_date = toDate.toISOString().split('T')[0];
      }
      console.log('📤 Dispatching fetchAdvanceReports with params:', params);

      dispatch(fetchAdvanceReports(params))
        .unwrap()
        .then(response => {
          console.log('✅ Load more success:', {
            loadedPage: response.currentPage,
            newItemsCount: response.data?.length || 0,
            hasMore: response.hasMore,
            totalItemsNow: advanceReports.length + (response.data?.length || 0),
          });
        })
        .catch(error => {
          console.error('❌ Load more error:', error);
        })
        .finally(() => {
          console.log('🏁 Load more finished, setting isLoadingMore to false');
          setIsLoadingMore(false);
        });
    } else {
      console.log('❌ Load more conditions not met:', {
        isLoadingMore: isLoadingMore ? 'Already loading more' : 'OK',
        hasMore: hasMore ? 'Has more data' : 'No more data',
        loading: loading ? 'Currently loading' : 'OK',
        refreshing: refreshing ? 'Currently refreshing' : 'OK',
      });
    }
  }, [
    isLoadingMore,
    hasMore,
    loading,
    refreshing,
    currentPage,
    perPageSize,
    dispatch,
    selectedHotel,
    selectedEmployee,
    fromDate,
    toDate,
    advanceReports.length,
  ]);

  const onRefresh = () => {
    console.log('🔄 Refreshing advance reports');
    setRefreshing(true);

    // FIX: Same logic for refresh - only add dates if filters are applied
    const params = {
      hotel_id: selectedHotel?.value || '',
      employee_id: selectedEmployee?.value || '',
      type: selectedType?.value || '',
      page: 1,
      per_page: perPageSize,
    };

    if (fromDate) {
      params.from_date = fromDate.toISOString().split('T')[0];
    }
    if (toDate) {
      params.to_date = toDate.toISOString().split('T')[0];
    }

    dispatch(fetchAdvanceReports(params)).finally(() => {
      console.log('✅ Refresh completed');
      setRefreshing(false);
    });
  };

  useEffect(() => {
    console.log('Employee dropdown options:', {
      totalEmployees: employees?.length,
      optionsCount: employeeOptions?.length,
      sampleOption: employeeOptions?.[1] || 'No employee available', // First actual employee
    });
    console.log('All employees in Redux store:', employees);
    console.log('Employee options for dropdown:', employeeOptions);
  }, [employeeOptions, employees]);

  const handleFromDateChange = (event, date) => {
    setShowFromDatePicker(false);
    if (date) {
      setFromDate(date);
      // If toDate is before the new fromDate, reset toDate
      if (toDate && date > toDate) {
        setToDate(null);
      }
    }
  };

  const handleToDateChange = (event, date) => {
    setShowToDatePicker(false);
    if (date) {
      setToDate(date);
    }
  };

  const applyFilters = () => {
    console.log('🔍 Applying filters with date range:', {
      from: fromDate ? fromDate.toISOString().split('T')[0] : 'Not selected',
      to: toDate ? toDate.toISOString().split('T')[0] : 'Not selected',
      hotel: selectedHotel?.label,
      employee: selectedEmployee?.label,
    });

    // Only send employee_id if not 'All Employees'
    const params = {
      hotel_id: selectedHotel?.value || '',
      type: selectedType?.value || '',
      page: 1,
      per_page: perPageSize,
    };
    if (selectedEmployee?.value) {
      params.employee_id = selectedEmployee.value;
    }
    if (fromDate) {
      params.from_date = fromDate.toISOString().split('T')[0];
    }
    if (toDate) {
      params.to_date = toDate.toISOString().split('T')[0];
    }

    console.log('📤 Dispatching fetchAdvanceReports with params:', params);
    dispatch(fetchAdvanceReports(params));
    setIsFilterModalVisible(false);
  };

  const clearFilters = () => {
    console.log('🧹 Clearing filters - fetching all data');
    setSelectedHotel(null);
    setSelectedEmployee(null);
    setSelectedType(null);
    setFromDate(null);
    setToDate(null);

    // Fetch without any filters
    dispatch(fetchAdvanceReports({ page: 1, per_page: perPageSize }));
    setIsFilterModalVisible(false);
  };

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="small" color={Colors.darkBlue} />
          <Text style={styles.loadingMoreText}>Loading more...</Text>
        </View>
      );
    }
    if (!hasMore && advanceReports.length > 0) {
      return (
        <View style={styles.loadingMoreContainer}>
          <Text style={styles.loadingMoreText}>
            No more reports to load ({advanceReports.length} total)
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderCardItem = ({ item, index }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        {item?.employee_name} (#{index + 1})
      </Text>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Date:</Text>
        <Text style={styles.cardValue}>
          {item?.records?.[0]?.date
            ? new Date(item.records[0].date).toLocaleDateString()
            : 'N/A'}
        </Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Hotel:</Text>
        <Text style={styles.cardValue}>{item?.hotel_name}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Amount (Credit)</Text>
        <Text style={[styles.cardValue, styles.amount]}>
          ₹{item?.total_credit}
        </Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Pending (Debit)</Text>
        <Text style={styles.cardValue}>{item?.total_debit}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Balance</Text>
        <Text style={styles.cardValue}>{item?.balance}</Text>
      </View>
    </View>
  );

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={styles.tableHeaderCell}>Date</Text>
      <Text style={styles.tableHeaderCell}>Employee</Text>
      <Text style={styles.tableHeaderCell}>Hotel</Text>
      <Text style={styles.tableHeaderCell}>Amount (Credit)</Text>
      <Text style={styles.tableHeaderCell}>Pending (Debit)</Text>
      <Text style={styles.tableHeaderCell}>Balance</Text>
    </View>
  );

  const renderTableRow = ({ item, index }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>
        {item?.records?.[0]?.date
          ? new Date(item.records[0].date).toLocaleDateString()
          : 'N/A'}
      </Text>
      <Text style={styles.tableCell}>{item.employee_name}</Text>
      <Text style={styles.tableCell}>{item.hotel_name}</Text>
      <Text style={[styles.tableCell, styles.amount]}>
        ₹{item.total_credit}
      </Text>
      <Text style={styles.tableCell}>{item.total_debit}</Text>
      <Text style={styles.tableCell}>{item.balance}</Text>
    </View>
  );

  if (loading && !refreshing && !isLoadingMore && advanceReports.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.darkBlue} />
        <Text style={styles.loadingText}>Loading advance reports...</Text>
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

  // Employee dropdown options: All Employees + all employees from Redux
  const employeeOptions = [
    // { value: '', label: 'All Employees' },
    ...(employees?.map(item => ({
      value: String(item.employee?.id), // use item.employee not item directly
      label: item.employee?.name || `Employee ${item.employee?.id}`,
    })) || []),
  ];

  const generateReportTable = () => {
    return `
    <table>
      <tr>
      <th>Date</th>
        <th>Employee</th>
        <th>Hotel</th>
        <th>Amount (Credit)</th>
        <th>Pending (Debit)</th>
        <th>Balance</th>
        
      </tr>
      ${advanceReports
        .map(
          item => `
        <tr>
         <td>${
           item?.records?.[0]?.date
             ? new Date(item.records[0].date).toLocaleDateString()
             : 'N/A'
         }</td>
          <td>${item.employee_name || '-'}</td>
          <td>${item.hotel_name || '-'}</td>
          <td>${item?.total_credit || '0'}</td>
          <td>${item?.total_debit || '0'}</td>
          <td>${item?.balance || '-'}</td>
         
        </tr>
      `,
        )
        .join('')}
      <tr class="total-row">
        <td colspan="3">Totals</td>
        <td>Total Credit: ${advanceReportTotals.total_credit || '0'}</td>
        <td>Total Debit: ${advanceReportTotals.total_debit || '0'}</td>
        <td>Balance: ${advanceReportTotals.balance || '0'}</td>
      </tr>
    </table>
  `;
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Advance Reports ({advanceReports.length})
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.downloadBtn}
            onPress={() =>
              handleDownloadPdf(generateReportTable, 'Advance Report')
            }
          >
            <Ionicons name="download" size={22} color={Colors.darkBlue} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setIsFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={22} color={Colors.darkBlue} />
            {(selectedHotel ||
              selectedEmployee ||
              selectedType ||
              fromDate ||
              toDate) && <View style={styles.filterBadge} />}
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
              color={Colors.darkBlue}
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
              <Text style={styles.modalTitle}>Filter Advance Reports</Text>
              <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.darkBlue} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <DropdownField
                label="Hotel"
                placeholder="Select Hotel"
                // value={selectedHotel?.value}
                value={selectedHotel?.value?.toString() || ''}
                options={hotelOptions}
                onSelect={setSelectedHotel}
              />
              <DropdownField
                label="Employee"
                placeholder={
                  employees.length ? 'Select Employee' : 'Loading employees...'
                }
                // value={selectedEmployee?.value}
                value={selectedEmployee?.value?.toString() || ''}
                options={employeeOptions}
                onSelect={item => {
                  console.log('Selected employee:', item);
                  setSelectedEmployee(item);
                }}
                disabled={employees.length === 0}
              />
              {/* {employees.length > 0 && (
                <Text style={{ fontSize: 12, color: '#666', marginTop: -8, marginBottom: 8 }}>
                  {employees.length} employees available
                </Text>
              )} */}
              <DropdownField
                label="Type"
                placeholder="Select Type"
                value={selectedType?.value || ''}
                options={[
                  { value: 'Credit', label: 'Credit' },
                  { value: 'Debit', label: 'Debit' },
                ]}
                onSelect={setSelectedType}
              />

              <View style={styles.dateFilterContainer}>
                <Text style={styles.filterLabel}>From Date</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowFromCalendar(true)}
                >
                  <Text
                    style={[
                      styles.placeholder,
                      { color: fromDate ? Colors.darkBlue : 'gray' }, // Change color based on fromDate
                    ]}
                  >
                    {fromDate ? fromDate.toLocaleDateString() : 'Select date'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color={Colors.darkBlue} />
                </TouchableOpacity>
                <CalendarModal
                  visible={showFromCalendar}
                  onClose={() => setShowFromCalendar(false)}
                  selectedDate={
                    fromDate ? fromDate.toISOString().split('T')[0] : null
                  }
                  onSelectDate={dateString => {
                    const selected = new Date(dateString);
                    setFromDate(selected);
                    // Reset toDate if earlier than fromDate
                    if (toDate && selected > toDate) setToDate(null);
                    setShowFromCalendar(false);
                  }}
                />
              </View>

              <View style={styles.dateFilterContainer}>
                <Text style={styles.filterLabel}>To Date</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowToCalendar(true)}
                >
                  <Text
                    style={[
                      styles.placeholder,
                      { color: toDate ? Colors.darkBlue : 'gray' }, // Change color based on toDate
                    ]}
                  >
                    {toDate ? toDate.toLocaleDateString() : 'Select date'}
                  </Text>

                  <Ionicons name="calendar-outline" size={20} color={Colors.darkBlue} />
                </TouchableOpacity>
                <CalendarModal
                  visible={showToCalendar}
                  onClose={() => setShowToCalendar(false)}
                  selectedDate={
                    toDate ? toDate.toISOString().split('T')[0] : null
                  }
                  onSelectDate={dateString => {
                    const selected = new Date(dateString);
                    // Optionally ensure toDate >= fromDate before setting
                    if (fromDate && selected < fromDate) {
                      alert('To Date cannot be before From Date');
                      return;
                    }
                    setToDate(selected);
                    setShowToCalendar(false);
                  }}
                />
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

      {viewMode === 'card' ? (
        <FlatList
          data={advanceReports}
          keyExtractor={(item, index) =>
            `advance_${item?.id || index}_${index}`
          }
          renderItem={renderCardItem}
          contentContainerStyle={styles.cardList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1c2f87']}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No advance reports available</Text>
            </View>
          }
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={21}
        />
      ) : (
        <ScrollView horizontal>
          <View style={styles.tableWrapper}>
            {renderTableHeader()}
            <FlatList
              data={advanceReports}
              keyExtractor={(item, index) =>
                `advance_table_${item?.id || index}_${index}`
              }
              renderItem={renderTableRow}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#1c2f87']}
                />
              }
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.3}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="document-text-outline"
                    size={50}
                    color="#ccc"
                  />
                  <Text style={styles.emptyText}>
                    No advance reports available
                  </Text>
                </View>
              }
              removeClippedSubviews={true}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={21}
            />
          </View>
        </ScrollView>
      )}

      <View style={styles.stickyTotalBar}>
        <View style={styles.row}>
          <Text style={styles.totalAmountLabel}>Total Credit</Text>
          <Text style={styles.totalAmountValue}>
            ₹{advanceReportTotals?.total_credit}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.totalAmountLabel}>Total Debit</Text>
          <Text style={styles.totalAmountValue}>
            ₹{advanceReportTotals?.total_debit}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.totalAmountLabel}>Balance</Text>
          <Text style={styles.totalAmountValue}>
            ₹{advanceReportTotals?.balance}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.veryLightBlue,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.darkBlue,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: Colors.red,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.darkBlue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 2,
    shadowColor: Colors.darkBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.darkBlue,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.LightGray,
    borderRadius: 8,
    padding: 2,
  },
  viewToggleButton: {
    padding: 8,
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: Colors.darkBlue,
  },
  dropdownContainer: {
    padding: 16,
    backgroundColor: Colors.white,
  },
  cardList: {
    paddingHorizontal: 8,
    paddingVertical: 14,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: Colors.darkBlue,
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
    color: Colors.darkBlue,
    marginBottom: 6,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'center',
  },
  cardLabel: {
    fontWeight: '600',
    color: Colors.CharcoalGray,
    width: 110,
    fontSize: 14,
  },
  cardValue: {
    flex: 1,
    color: Colors.gray,
    fontSize: 14,
  },
  amount: {
    fontWeight: 'bold',
    color: Colors.orange,
  },
  dateFilterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    marginBottom: 8,
    color: Colors.darkBlue,
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
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginHorizontal: 8,
    marginVertical: 16,
    paddingBottom: 8,
    minWidth: windowWidth - 32,
    elevation: 2,
    shadowColor: Colors.darkBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.darkBlue,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  tableHeaderCell: {
    color: Colors.white,
    fontWeight: 'bold',
    width: 150,
    textAlign: 'center',
    fontSize: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: Colors.LightGray,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: Colors.white,
  },
  tableCell: {
    width: 150,
    textAlign: 'center',
    color: Colors.CharcoalGray,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: Colors.gray,
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
  filterBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.orange,
  },
  downloadBtn: {
    marginRight: 12,
    padding: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '92%',
    backgroundColor: Colors.white,
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
    color: Colors.darkBlue,
  },
  modalCloseBtn: {
    marginTop: 20,
    backgroundColor: Colors.darkBlue,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  modalCloseText: {
    color: Colors.white,
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
    backgroundColor: Colors.gray,
  },
  applyButton: {
    backgroundColor: Colors.darkBlue,
  },
  modalButtonText: {
    color: Colors.white,
    fontSize: 16,
  },
  clearFilterButton: {
    backgroundColor: Colors.LightGray,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 8,
  },
  clearFilterButtonText: {
    color: Colors.darkBlue,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.darkBlue,
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
    backgroundColor: Colors.white,
    borderTopColor: Colors.darkBlue,
    borderTopWidth: 1,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    marginTop: 0,
    marginBottom: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  totalAmountLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.darkBlue,
  },
  totalAmountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.orange,
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
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
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
  paginationInfo: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.LightGray,
  },
  paginationText: {
    fontSize: 14,
    color: Colors.gray,
  },
  loadMoreButton: {
    backgroundColor: Colors.darkBlue,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 4,
  },
  loadMoreText: {
    color: Colors.white,
    fontSize: 14,
  },
  footer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  footerText: {
    fontSize: 14,
    color: Colors.darkBlue,
    marginLeft: 10,
  },
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  loadingMoreText: {
    marginLeft: 10,
    color: Colors.darkBlue,
  },
  placeholder: {
    color: Colors.gray,
    fontSize: 16,
  },
});

export default AdvanceReportScreen;
