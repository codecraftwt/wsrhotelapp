import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';

const LedgerFilter = ({
    filters,
    setFilters,
    hotels = [],
    employees = [],
    onSearch,
    onClear
}) => {
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);

    // Prepare dropdown options
    const typeOptions = [
        { label: 'Select Type', value: '' },
        { label: 'Credit', value: 'Credit' },
        { label: 'Debit', value: 'Debit' },
    ];

    const hotelOptions = [
        { label: 'Select Hotel', value: '' },
        ...hotels.map(hotel => ({
            label: hotel.name,
            value: hotel.id.toString()
        }))
    ];

    const employeeOptions = [
        { label: 'Select Employee', value: '' },
        ...employees
            .filter(emp => emp.hotel_id === filters.hotel_id)
            .map(emp => ({
                label: emp.name,
                value: emp.id.toString()
            }))
    ];

    const handleFromDateChange = (event, date) => {
        setShowFromDatePicker(false);
        if (date) {
            const formattedDate = date.toISOString().split('T')[0];
            setFilters({ ...filters, from: formattedDate });
        }
    };

    const handleToDateChange = (event, date) => {
        setShowToDatePicker(false);
        if (date) {
            const formattedDate = date.toISOString().split('T')[0];
            setFilters({ ...filters, to: formattedDate });
        }
    };

    const handleHotelChange = (item) => {
        setFilters({
            ...filters,
            hotel_id: item.value,
            employee_id: '' // Reset employee when hotel changes
        });
    };

    const handleEmployeeChange = (item) => {
        setFilters({
            ...filters,
            employee_id: item.value
        });
    };

    const handleTypeChange = (item) => {
        setFilters({
            ...filters,
            type: item.value
        });
    };

    return (
        <View style={styles.container}>
            {/* Hotel Dropdown */}
            <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                data={hotelOptions}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select Hotel"
                searchPlaceholder="Search hotels..."
                value={filters.hotel_id}
                onChange={handleHotelChange}
            />

            {/* Employee Dropdown */}
            <Dropdown
                style={[
                    styles.dropdown,
                    !filters.hotel_id && styles.disabledDropdown
                ]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                data={employeeOptions}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={filters.hotel_id ? "Select Employee" : "Select hotel first"}
                searchPlaceholder="Search employees..."
                value={filters.employee_id}
                onChange={handleEmployeeChange}
                disable={!filters.hotel_id}
            />

            {/* Date Range Row */}
            <View style={styles.dateRow}>
                {/* From Date */}
                <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowFromDatePicker(true)}
                >
                    <Text style={filters.from ? styles.dateText : styles.placeholderText}>
                        {filters.from || 'From Date'}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#666" />
                </TouchableOpacity>

                {/* To Date */}
                <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowToDatePicker(true)}
                >
                    <Text style={filters.to ? styles.dateText : styles.placeholderText}>
                        {filters.to || 'To Date'}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#666" />
                </TouchableOpacity>
            </View>

            {/* Type Dropdown */}
            <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                data={typeOptions}
                labelField="label"
                valueField="value"
                placeholder="Select Type"
                value={filters.type}
                onChange={handleTypeChange}
            />

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => {
                        setFilters({
                            hotel_id: '',
                            employee_id: '',
                            type: '',
                            from: '',
                            to: ''
                        });
                        onClear();
                    }}
                >
                    <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={onSearch}
                >
                    <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
            </View>

            {/* Date Pickers */}
            {showFromDatePicker && (
                <DateTimePicker
                    value={filters.from ? new Date(filters.from) : new Date()}
                    mode="date"
                    display="default"
                    onChange={handleFromDateChange}
                />
            )}
            {showToDatePicker && (
                <DateTimePicker
                    value={filters.to ? new Date(filters.to) : new Date()}
                    mode="date"
                    display="default"
                    onChange={handleToDateChange}
                    minimumDate={filters.from ? new Date(filters.from) : undefined}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        margin: 8,
        elevation: 2,
    },
    dropdown: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    disabledDropdown: {
        backgroundColor: '#f5f5f5',
    },
    placeholderStyle: {
        fontSize: 16,
        color: '#999',
    },
    selectedTextStyle: {
        fontSize: 16,
        color: '#333',
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    dateInput: {
        flex: 1,
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginRight: 8,
        backgroundColor: '#fff',
    },
    dateText: {
        fontSize: 16,
        color: '#333',
    },
    placeholderText: {
        fontSize: 16,
        color: '#999',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    searchButton: {
        backgroundColor: '#F36F21',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginLeft: 12,
    },
    searchButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    clearButton: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    clearButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default LedgerFilter;