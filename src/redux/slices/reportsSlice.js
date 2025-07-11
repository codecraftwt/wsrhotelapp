import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk to fetch reports
export const fetchReports = createAsyncThunk(
    'reports/fetchReports',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('reports/get_reports.php');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data); // Handle error
        }
    }
);

// Define the initial state
const initialState = {
    reports: null, // stores all reports data
    loading: false,
    error: null,
    selectedType: 'advances', // default filter type
};

// Create the slice
const reportsSlice = createSlice({
    name: 'reports',
    initialState,
    reducers: {
        // Action to change the selected report type
        setSelectedType: (state, action) => {
            state.selectedType = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchReports.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReports.fulfilled, (state, action) => {
                state.loading = false;
                state.reports = action.payload.data; // Store reports data from the API
            })
            .addCase(fetchReports.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to load reports'; // Handle error
            });
    },
});

export const { setSelectedType } = reportsSlice.actions;

export default reportsSlice.reducer;
