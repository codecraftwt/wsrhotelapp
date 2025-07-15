import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk to fetch reports
export const fetchReports = createAsyncThunk(
    'reports/fetchReports',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/reports', { params });
            return {
                data: response.data.data, // The full response data
                isFiltered: !!params.type // Flag to indicate if this is a filtered request
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


// Define the initial state
const initialState = {
    reports: null, // stores all reports data
    loading: false,
    error: null,
    selectedType: 'all', // Default to show all
    isFiltered: false
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
                state.reports = action.payload.data;
                state.isFiltered = action.payload.isFiltered;
                // If this was a filtered request, update the selectedType
                if (action.payload.isFiltered && action.meta.arg.type) {
                    state.selectedType = action.meta.arg.type;
                }
            })
            .addCase(fetchReports.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to load reports'; // Handle error
            });
    },
});

export const { setSelectedType } = reportsSlice.actions;

export default reportsSlice.reducer;
