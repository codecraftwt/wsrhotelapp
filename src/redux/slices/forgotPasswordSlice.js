import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Request password reset (send email)
export const requestPasswordReset = createAsyncThunk(
  'forgotPassword/request',
  async (email, { rejectWithValue }) => {
    try {
      const res = await api.post('/request-password-reset', { email });
      return res.data;
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Request failed';
      return rejectWithValue(message);
    }
  }
);

// Reset password with token
export const resetPassword = createAsyncThunk(
  'forgotPassword/reset',
  async (payload, { rejectWithValue }) => {
    try {
      // payload: { email, token, new_password, confirm_password }
      const res = await api.post('/reset-password', payload);
      return res.data;
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Reset failed';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  requesting: false,
  requested: false,
  resetting: false,
  resetSuccess: false,
  message: null,
  error: null,
};

const forgotPasswordSlice = createSlice({
  name: 'forgotPassword',
  initialState,
  reducers: {
    clearForgotState(state) {
      state.requesting = false;
      state.requested = false;
      state.resetting = false;
      state.resetSuccess = false;
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // requestPasswordReset
      .addCase(requestPasswordReset.pending, state => {
        state.requesting = true;
        state.requested = false;
        state.error = null;
        state.message = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.requesting = false;
        state.requested = true;
        state.message = action.payload?.message || 'Password reset email sent successfully';
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.requesting = false;
        state.requested = false;
        state.error = action.payload || 'Failed to request password reset';
      })
      // resetPassword
      .addCase(resetPassword.pending, state => {
        state.resetting = true;
        state.resetSuccess = false;
        state.error = null;
        state.message = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.resetting = false;
        state.resetSuccess = true;
        state.message = action.payload?.message || 'Password has been reset successfully';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetting = false;
        state.resetSuccess = false;
        state.error = action.payload || 'Failed to reset password';
      });
  },
});

export const { clearForgotState } = forgotPasswordSlice.actions;
export default forgotPasswordSlice.reducer;


