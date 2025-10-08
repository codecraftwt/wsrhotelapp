import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ email, current_password, new_password, confirm_password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/change-password', {
        email,
        current_password,
        new_password,
        confirm_password,
      });

      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to change password';
      return rejectWithValue(message);
    }
  }
);

const changePasswordSlice = createSlice({
  name: 'changePassword',
  initialState: {
    loading: false,
    success: false,
    error: null,
    message: null,
  },
  reducers: {
    resetChangePasswordState(state) {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(changePassword.pending, state => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.message = action.payload?.message || 'Password changed successfully';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || 'Failed to change password';
      });
  },
});

export const { resetChangePasswordState } = changePasswordSlice.actions;
export default changePasswordSlice.reducer;


