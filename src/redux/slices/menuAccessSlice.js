// redux/slices/menuAccessSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

export const fetchMenuAccess = createAsyncThunk(
  'menuAccess/fetchMenuAccess',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}/menu-access`);
      console.log("Menu Access --->", response.data.menus);      
      return response.data.menus; // returns array of menus
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch menu access');
    }
  }
);

const menuAccessSlice = createSlice({
  name: 'menuAccess',
  initialState: {
    menus: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchMenuAccess.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuAccess.fulfilled, (state, action) => {
        state.loading = false;
        state.menus = action.payload;
      })
      .addCase(fetchMenuAccess.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default menuAccessSlice.reducer;
