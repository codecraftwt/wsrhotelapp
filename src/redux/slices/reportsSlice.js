import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk to fetch reports
export const fetchReports = createAsyncThunk(
    'reports/fetchReports',
    async (params = {}, { rejectWithValue }) => {
        try {
            console.log("params", params)
            const response = await api.get('/reports', { params });
            console.log("response", response.data)
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
                // Normalize response: always set reports as an object with keys
                if (Array.isArray(action.payload.data)) {
                    // If filtered, put array under the correct key
                    const type = action.meta.arg.type;
                    state.reports = { [type]: action.payload.data };
                } else {
                    // Unfiltered, use as is
                    state.reports = action.payload.data;
                }
                state.isFiltered = action.payload.isFiltered;
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
