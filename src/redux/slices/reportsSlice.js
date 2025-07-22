import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Async thunk to fetch reports
export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('params', params);
      const response = await api.get('/reports', { params });
      console.log('response', response.data);
      return {
        data: response.data.data, // The full response data
        isFiltered: !!params.type, // Flag to indicate if this is a filtered request
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Async thunk to fetch advance reports
export const fetchAdvanceReports = createAsyncThunk(
  'reports/fetchAdvanceReports',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('params', params);
      const response = await api.get('/advance-reports', { params });
      console.log('response', response.data);
      return {
        data: response.data.data,
        totals: response.data.totals,
        isFiltered: !!params.type, // Flag to indicate if this is a filtered request
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Async thunk to fetch payment reports
export const fetchPaymentReports = createAsyncThunk(
  'reports/fetchPaymentReports',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('params', params);
      const response = await api.get('/payment-reports', { params });
      console.log('response', response.data);
      return {
        data: response.data.data,
        totals: response.data.totals,
        isFiltered: !!params.platform_id, // Flag to indicate if this is a filtered request
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Async thunk to fetch material request reports
export const fetchMaterialRequestReports = createAsyncThunk(
  'reports/fetchMaterialRequestReports',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('params', params);
      const response = await api.get('/material-request-reports', {
        params,
      });
      console.log('response', response.data);
      return {
        data: response.data.data,
        totals: response.data.totals,
        isFiltered: !!params.material_id, // Flag to indicate if this is a filtered request
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Define the initial state
const initialState = {
  reports: null,
  advanceReports: null,
  paymentReports: null,
  materialRequestReports: null,
  loading: false,
  error: null,
  selectedType: 'all', // Default to show all
  isFiltered: false,
  advanceReportTotals: {
    // separate state for advance report totals
    total_credit: 0,
    total_debit: 0,
    balance: 0,
  },
  paymentReportTotals: {
    // separate state for payment report totals
    total_credit: 0,
    total_debit: 0,
    balance: 0,
  },
  materialRequestReportTotals: {
    // separate state for material request report totals
    total_instock: 0,
    total_used: 0,
    remaining: 0,
  },
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
  extraReducers: builder => {
    builder
      .addCase(fetchReports.pending, state => {
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
      })

      .addCase(fetchAdvanceReports.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdvanceReports.fulfilled, (state, action) => {
        state.loading = false;
        state.advanceReports = action.payload.data;
        state.advanceReportTotals = action.payload.totals; // Update advance report totals
        state.isFiltered = action.payload.isFiltered;
      })
      .addCase(fetchAdvanceReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load advance reports';
      })
      .addCase(fetchPaymentReports.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentReports.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentReports = action.payload.data;
        state.paymentReportTotals = action.payload.totals; // Update payment report totals
        state.isFiltered = action.payload.isFiltered;
      })
      .addCase(fetchPaymentReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load payment reports';
      })
      .addCase(fetchMaterialRequestReports.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaterialRequestReports.fulfilled, (state, action) => {
        state.loading = false;
        state.materialRequestReports = action.payload.data;
        state.materialRequestReportTotals = action.payload.totals; // Update material request report totals
        state.isFiltered = action.payload.isFiltered;
      })
      .addCase(fetchMaterialRequestReports.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || 'Failed to load material request reports';
      });
  },
});

export const { setSelectedType } = reportsSlice.actions;

export default reportsSlice.reducer;
