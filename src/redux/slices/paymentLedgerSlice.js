import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Get Payment Ledger Data
export const fetchPaymentLedger = createAsyncThunk(
  'paymentLedger/fetchPaymentLedger',
  async (filters = {}, { rejectWithValue }) => {
    try {
      // Build query string from filters
      const params = {};
      if (filters.mode) params.mode = filters.mode;
      if (filters.platform_name) params.platform_name = filters.platform_name;
      if (filters.from_date) params.from_date = filters.from_date;
      if (filters.to_date) params.to_date = filters.to_date;
      if (filters.hotel_id) params.hotel_id = filters.hotel_id;
      if (filters.page) params.page = filters.page;
      if (filters.per_page) params.per_page = filters.per_page;
      const res = await api.get('/payment-ledgers', { params });
      console.log('Payment ledger --------------', res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const addPaymentLedger = createAsyncThunk(
  'paymentLedger/addPaymentLedger',
  async (paymentData, { rejectWithValue }) => {
    console.log('paymentData ------------', paymentData);

    try {
      const res = await api.post('payment-ledgers', paymentData);
      console.log('Add Payment Ledger Response:', res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const editPaymentLedger = createAsyncThunk(
  'paymentLedger/editPaymentLedger',
  async ({ id, paymentData }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/payment-ledgers/update/${id}`, paymentData);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deletePaymentLedger = createAsyncThunk(
  'paymentLedger/deletePaymentLedger',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.post(`/payment-ledgers/delete/${id}`);
      return { id, ...res.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchPlatformModes = createAsyncThunk(
  'paymentLedger/fetchPlatformModes',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/payment-modes');
      console.log('Platform Modes: ', res.data);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Slice
const paymentLedgerSlice = createSlice({
  name: 'paymentLedger',
  initialState: {
    paymentLedgers: [],
    platformModes: [],
    totals: {
      total_credit: 0,
      total_debit: 0,
      total_balance: 0,
    },
    loading: false,
    error: null,
    page: 1,
    perPage: 20,
    hasMore: true,
  },
  reducers: {
    resetPaymentLedger: (state) => {
      state.paymentLedgers = [];
      state.page = 1;
      state.hasMore = true;
      state.totals = { total_credit: 0, total_debit: 0, total_balance: 0 };
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPaymentLedger.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentLedger.fulfilled, (state, action) => {
        const { data, totals } = action.payload.data ? action.payload : { data: { items: [] }, totals: {} };
        const items = action.payload.data?.items || [];
        const page = action.meta.arg?.page || 1;
        if (page > 1) {
          state.paymentLedgers = [...state.paymentLedgers, ...items];
        } else {
          state.paymentLedgers = items;
        }
        state.totals = action.payload.totals;
        state.page = page;
        state.hasMore = items.length === (action.meta.arg?.per_page || state.perPage);
        state.loading = false;
      })
      .addCase(fetchPaymentLedger.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addPaymentLedger.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPaymentLedger.fulfilled, (state, action) => {
        // After successfully adding, we can update the payment ledger list
        state.paymentLedgers.push(action.payload.data); // Assuming payload contains a `data` field
        state.loading = false;
      })
      .addCase(addPaymentLedger.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editPaymentLedger.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editPaymentLedger.fulfilled, (state, action) => {
        // Update the edited item in the list
        const updated = action.payload.data;
        const idx = state.paymentLedgers.findIndex(item => item.id === updated.id);
        if (idx !== -1) {
          state.paymentLedgers[idx] = updated;
        }
        state.loading = false;
      })
      .addCase(editPaymentLedger.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deletePaymentLedger.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePaymentLedger.fulfilled, (state, action) => {
        // Remove the deleted item from the list
        state.paymentLedgers = state.paymentLedgers.filter(item => item.id !== action.payload.id);
        state.loading = false;
      })
      .addCase(deletePaymentLedger.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPlatformModes.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlatformModes.fulfilled, (state, action) => {
        state.platformModes = action.payload;
        state.loading = false;
      })
      .addCase(fetchPlatformModes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetPaymentLedger } = paymentLedgerSlice.actions;

export default paymentLedgerSlice.reducer;
