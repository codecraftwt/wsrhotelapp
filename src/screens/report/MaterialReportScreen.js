import React, { useState, useEffect, useCallback } from 'react';
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
import { fetchMaterialRequestReports } from '../../redux/slices/reportsSlice';
import DropdownField from '../../components/DropdownField';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { fetchHotels } from '../../redux/slices/hotelSlice';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchMaterialItems } from '../../redux/slices/materialItemsSlice';
import { generatePdf } from '../../utils/generatePdf';
import { handleDownloadPdf } from '../../utils/handleDownloadPdf';

const MaterialReportScreen = () => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const {
    materialRequestReports,
    materialRequestReportTotals,
    loading,
    error,
    materialRequestPage: page,  // Changed to use materialRequestPage
    materialRequestHasMore: hasMore,
  } = useSelector(state => state.reports);
  const { hotels } = useSelector(state => state.hotel);
  const { materialItems } = useSelector(state => state.materialItems);

  // Pagination state
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const perPage = 10; // Number of items per page

  const [viewMode, setViewMode] = useState('card');
  const [refreshing, setRefreshing] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  // Initial load
  useEffect(() => {
    dispatch(fetchMaterialRequestReports({ page: 1, per_page: perPage }));
    dispatch(fetchHotels());
    dispatch(fetchMaterialItems());
  }, [dispatch]);

  // In your MaterialReportScreen component
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !loading && !refreshing) {
      setIsLoadingMore(true);

      const params = {
        hotel_id: selectedHotel?.value || '',
        material_id: selectedMaterial?.value || '',
        page: page + 1,
        per_page: perPage,
      };

      if (fromDate) {
        params.from_date = fromDate.toISOString().split('T')[0];
      }
      if (toDate) {
        params.to_date = toDate.toISOString().split('T')[0];
      }

      dispatch(fetchMaterialRequestReports(params))
        .finally(() => {
          setIsLoadingMore(false);
        });
    }
  }, [isLoadingMore, hasMore, loading, refreshing, page, perPage, selectedHotel, selectedMaterial, fromDate, toDate, dispatch]);

  const onRefresh = () => {
    setRefreshing(true);

    const params = {
      hotel_id: selectedHotel?.value || '',
      material_id: selectedMaterial?.value || '',
      page: 1,
      per_page: perPage,
    };

    if (fromDate) {
      params.from_date = fromDate.toISOString().split('T')[0];
    }
    if (toDate) {
      params.to_date = toDate.toISOString().split('T')[0];
    }

    dispatch(fetchMaterialRequestReports(params)).finally(() => setRefreshing(false));
  };

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
    const params = {
      hotel_id: selectedHotel?.value || '',
      material_id: selectedMaterial?.value || '',
      page: 1,
      per_page: perPage,
    };

    // Only add date filters if they exist
    if (fromDate) {
      params.from_date = fromDate.toISOString().split('T')[0];
    }
    if (toDate) {
      params.to_date = toDate.toISOString().split('T')[0];
    }

    dispatch(fetchMaterialRequestReports(params));
    setIsFilterModalVisible(false);
  };

  const clearFilters = () => {
    setSelectedHotel(null);
    setSelectedMaterial(null);
    setFromDate(null);
    setToDate(null);
    dispatch(fetchMaterialRequestReports({ page: 1, per_page: perPage }));
    setIsFilterModalVisible(false);
  };

  const generateReportTable = () => {
    return `
    <table>
      <tr>
        <th>Material</th>
        <th>Hotel</th>
        <th>Purchased Quantity</th>
        <th>Used Quantity</th>
        <th>Balance Quantity</th>
      </tr>
      ${materialRequestReports
        .map(
          item => `
        <tr>
          <td>${item?.material_name || '-'}</td>
          <td>${item?.hotel_name || '-'}</td>
          <td>${item?.total_instock || '0'}</td>
          <td>${item?.remaining || '0'}</td>
          <td>${item?.total_used || '0'}</td>
        </tr>
      `,
        )
        .join('')}
      <tr class="total-row">
        <td colspan="2">Totals</td>
        <td>Total in stock: ${materialRequestReportTotals.total_instock || '0'}</td>
        <td>Total used: ${materialRequestReportTotals.total_used || '0'}</td>
        <td>Remaining: ${materialRequestReportTotals.remaining || '0'}</td>
      </tr>
    </table>
  `;
  };

  const renderCardItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item?.material_name}</Text>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Hotel:</Text>
        <Text style={styles.cardValue}>{item?.hotel_name}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Purchased Quantity:</Text>
        <Text style={[styles.cardValue, styles.amount]}>{item?.total_instock}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Used Quantity:</Text>
        <Text style={[styles.cardValue, styles.amount]}>{item?.remaining}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Balance Quantity:</Text>
        <Text style={[styles.cardValue, styles.amount]}>{item?.total_used}</Text>
      </View>
    </View>
  );

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={styles.tableHeaderCell}>Material</Text>
      <Text style={styles.tableHeaderCell}>Hotel</Text>
      <Text style={styles.tableHeaderCell}>Purchased Quantity</Text>
      <Text style={styles.tableHeaderCell}>Used Quantity</Text>
      <Text style={styles.tableHeaderCell}>Balance Quantity</Text>
    </View>
  );

  const renderTableRow = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{item?.material_name}</Text>
      <Text style={styles.tableCell}>{item?.hotel_name}</Text>
      <Text style={styles.tableCell}>{item?.total_instock}</Text>
      <Text style={[styles.tableCell, styles.amount]}>{item?.remaining}</Text>
      <Text style={[styles.tableCell, styles.amount]}>{item?.total_used}</Text>
    </View>
  );

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="small" color="#1c2f87" />
          <Text style={styles.loadingMoreText}>Loading more...</Text>
        </View>
      );
    }

    if (!hasMore && materialRequestReports.length > 0) {
      return (
        <View style={styles.loadingMoreContainer}>
          <Text style={styles.loadingMoreText}>No more reports to load</Text>
        </View>
      );
    }

    return null;
  };

  if (loading && !refreshing && !isLoadingMore) {
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

  const materialOptions = materialItems.map(item => ({
    value: item.id,
    label: item.name,
  }));

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Material Reports</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.downloadBtn}
            onPress={() =>
              handleDownloadPdf(generateReportTable, 'Material Report')
            }
          >
            <Ionicons name="download" size={22} color="#1c2f87" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setIsFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={22} color="#1c2f87" />
            {(selectedHotel || selectedMaterial || fromDate || toDate) && (
              <View style={styles.filterBadge} />
            )}
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
              <Text style={styles.modalTitle}>Filter Material Reports</Text>
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
                label="Material"
                placeholder="Select Material"
                value={selectedMaterial?.value}
                options={materialOptions}
                onSelect={setSelectedMaterial}
              />

              <View style={styles.dateFilterContainer}>
                <Text style={styles.filterLabel}>From Date</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowFromDatePicker(true)}
                >
                  <Text>{fromDate ? fromDate.toLocaleDateString() : "Select date"}</Text>                  <Ionicons name="calendar-outline" size={20} color="#1c2f87" />
                </TouchableOpacity>
                {showFromDatePicker && (
                  <DateTimePicker
                    value={fromDate || new Date()}
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
                  <Text>{toDate ? toDate.toLocaleDateString() : "Select date"}</Text>                  <Ionicons name="calendar-outline" size={20} color="#1c2f87" />
                </TouchableOpacity>
                {showToDatePicker && (
                  <DateTimePicker
                    value={toDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleToDateChange}
                    minimumDate={fromDate || new Date()}
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

      {viewMode === 'card' ? (
        <FlatList
          data={materialRequestReports}
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
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>
                No material reports available
              </Text>
            </View>
          }
          removeClippedSubviews={true}

          initialNumToRender={10} // Only render initial items
          maxToRenderPerBatch={10} // Render items in batches
          windowSize={21}
        />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tableWrapper}>
            {renderTableHeader()}
            <FlatList
              data={materialRequestReports}
              keyExtractor={item => item?.id?.toString()}
              renderItem={renderTableRow}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#1c2f87']}
                />
              }
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.1}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="document-text-outline"
                    size={50}
                    color="#ccc"
                  />
                  <Text style={styles.emptyText}>
                    No material reports available
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
          <Text style={styles.totalAmountLabel}>Total In Stock</Text>
          <Text style={styles.totalAmountValue}>
            {materialRequestReportTotals.total_instock}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.totalAmountLabel}>Total Used</Text>
          <Text style={styles.totalAmountValue}>
            {materialRequestReportTotals.total_used}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.totalAmountLabel}>Remaining</Text>
          <Text style={styles.totalAmountValue}>
            {materialRequestReportTotals.remaining}
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
    backgroundColor: '#f4f6fb',
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
  cardList: {
    paddingHorizontal: 8,
    paddingVertical: 14,
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
    // borderRadius: 14,
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
    // borderTopLeftRadius: 14,
    // borderTopRightRadius: 14,
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
  downloadBtn: {
    marginRight: 12,
    padding: 4,
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
  totalAmountLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c2f87',
  },
  totalAmountValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fe8c06',
  },
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  loadingMoreText: {
    marginLeft: 10,
    color: '#1c2f87',
  },
  filterBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fe8c06',
  },
});

export default MaterialReportScreen;