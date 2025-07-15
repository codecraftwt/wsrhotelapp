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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReports, setSelectedType } from '../../redux/slices/reportsSlice';
import DropdownField from '../../components/DropdownField';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ReportsScreen = () => {
  const dispatch = useDispatch();
  const { reports, loading, error, selectedType } = useSelector(
    state => state.reports,
  );
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [refreshing, setRefreshing] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [tempSelectedType, setTempSelectedType] = useState(selectedType);
  useEffect(() => {
    if (isFilterModalVisible) {
      setTempSelectedType(selectedType);
    }
  }, [isFilterModalVisible]);

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchReports()).finally(() => setRefreshing(false));
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

  const handleReportTypeChange = item => {
    dispatch(setSelectedType(item.value));
  };

  const renderCardItem = ({ item }) => {
    return (
      <View style={styles.card}>
        {selectedType === 'advances' && (
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
        {selectedType === 'expenses' && (
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
        {selectedType === 'orders' && (
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

  const renderTableHeader = () => {
    const headers = {
      advances: ['Employee', 'Amount', 'Reason', 'Date'],
      expenses: ['Title', 'Amount', 'Payment Mode', 'Date'],
      orders: ['Platform', 'Total Amount', 'Received', 'Settlement Date'],
    };

    return (
      <View style={styles.tableHeader}>
        {headers[selectedType]?.map((header, index) => (
          <Text key={index} style={styles.tableHeaderCell}>
            {header}
          </Text>
        ))}
      </View>
    );
  };

  const renderTableRow = ({ item }) => {
    return (
      <View style={styles.tableRow}>
        {selectedType === 'advances' && (
          <>
            <Text style={styles.tableCell}>{item.employee.name}</Text>
            <Text style={[styles.tableCell, styles.amount]}>
              ₹{item.amount}
            </Text>
            <Text style={styles.tableCell}>{item.reason}</Text>
            <Text style={styles.tableCell}>{item.date}</Text>
          </>
        )}
        {selectedType === 'expenses' && (
          <>
            <Text style={styles.tableCell}>{item.title}</Text>
            <Text style={[styles.tableCell, styles.amount]}>
              ₹{item.amount}
            </Text>
            <Text style={styles.tableCell}>{item.payment_mode}</Text>
            <Text style={styles.tableCell}>{item.expense_date}</Text>
          </>
        )}
        {selectedType === 'orders' && (
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
              <Text style={styles.modalTitle}>Select Report Type</Text>
              <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1c2f87" />
              </TouchableOpacity>
            </View>
            <DropdownField
              label="Report Type"
              placeholder="Select Type"
              value={tempSelectedType}
              options={dropdownOptions}
              onSelect={item => setTempSelectedType(item.value)}
            />
            <View style={styles.modalButtonRow}>
              <Pressable
                style={[styles.modalButton, styles.clearFilterButton]}
                onPress={() => setIsFilterModalVisible(false)} // Just close without saving
              >
                <Text style={styles.clearFilterButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.applyButton]}
                onPress={() => {
                  dispatch(setSelectedType(tempSelectedType));
                  setIsFilterModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>Apply</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {viewMode === 'card' ? (
        <FlatList
          data={getFilteredReports()}
          keyExtractor={item => item.id.toString()}
          renderItem={renderCardItem}
          contentContainerStyle={styles.cardList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1c2f87']}
              tintColor="#1c2f87"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No reports available</Text>
            </View>
          }
        />
      ) : (
        <ScrollView horizontal>
          <View>
            {renderTableHeader()}
            <FlatList
              data={getFilteredReports()}
              keyExtractor={item => item.id.toString()}
              renderItem={renderTableRow}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#1c2f87']}
                  tintColor="#1c2f87"
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="document-text-outline"
                    size={50}
                    color="#ccc"
                  />
                  <Text style={styles.emptyText}>No reports available</Text>
                </View>
              }
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
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
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1c2f87',
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  cardLabel: {
    fontWeight: 'bold',
    color: '#495057',
    width: 100,
  },
  cardValue: {
    flex: 1,
    color: '#6c757d',
  },
  amount: {
    fontWeight: 'bold',
    color: '#28a745',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1c2f87',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    color: '#fff',
    fontWeight: 'bold',
    width: 150,
    textAlign: 'center',
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
});

export default ReportsScreen;
