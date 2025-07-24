import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Fetch All Payment Modes
export const fetchPaymentModes = createAsyncThunk(
  'paymentModes/fetchPaymentModes',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/payment-modes');
      console.log("All payment modes", res.data);

      return res.data?.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  },
);

// Add Payment Mode
export const addPaymentMode = createAsyncThunk(
  'paymentModes/addPaymentMode',
  async (paymentModeData, { rejectWithValue }) => {
    try {
      const res = await api.post('/payment-modes', paymentModeData);

      // Check if the response contains the payment mode data
      if (res.data?.message === 'Payment mode created') {
        console.log("Added payment mode --->", res.data);

        // Return the payment mode data in the response
        return res.data.data; // Returning the added payment mode from the response
      } else {
        return rejectWithValue(res.data?.message || 'Failed to add payment mode');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  },
);

// Edit Payment Mode
export const editPaymentMode = createAsyncThunk(
  'paymentModes/editPaymentMode',
  async (paymentModeData, { rejectWithValue }) => {
    try {
      const res = await api.post(`/payment-modes/${paymentModeData.id}/update`, paymentModeData);
      if (res.data?.message === 'Payment mode updated') {
        return res.data.data;
      } else {
        return rejectWithValue(res.data?.message || 'Failed to update payment mode');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

// Delete Payment Mode
export const deletePaymentMode = createAsyncThunk(
  'paymentModes/deletePaymentMode',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.post(`/payment-modes/${id}/delete`);
      console.log("Payment mode deleted --->", res.data);

      if (res.data?.message === 'Payment mode deleted') {
        return { id };
      } else {
        return rejectWithValue(res.data?.message || 'Failed to delete payment mode');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

// Initial State
const initialState = {
  paymentModes: [],
  loading: false,
  error: null,
};

// Slice
const paymentModesSlice = createSlice({
  name: 'paymentModes',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // Fetch Payment Modes
      .addCase(fetchPaymentModes.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentModes.fulfilled, (state, action) => {
        state.paymentModes = action.payload;
        state.loading = false;
      })
      .addCase(fetchPaymentModes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Payment Mode
      .addCase(addPaymentMode.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPaymentMode.fulfilled, (state, action) => {
        state.paymentModes.push(action.payload);
        state.loading = false;
      })
      .addCase(addPaymentMode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Edit Payment Mode
      .addCase(editPaymentMode.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editPaymentMode.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.paymentModes.findIndex(item => item.id === updated.id);
        if (index !== -1) {
          state.paymentModes[index] = updated;
        }
        state.loading = false;
      })
      .addCase(editPaymentMode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Payment Mode
      .addCase(deletePaymentMode.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePaymentMode.fulfilled, (state, action) => {
        state.paymentModes = state.paymentModes.filter(item => item.id !== action.payload.id);
        state.loading = false;
      })
      .addCase(deletePaymentMode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default paymentModesSlice.reducer;
