// redux/slices/menuAccessSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

export const fetchMenuAccess = createAsyncThunk(
  'menuAccess/fetchMenuAccess',
  async (userId, { rejectWithValue }) => {
    try {
      console.log('Fetching menu access for user ID:', userId);
      const response = await api.get(`/users/${userId}/menu-access`);
      console.log("Menu Access Response --->", response.data);      
      console.log("Menu Access Menus --->", response.data.menus);      
      return response.data.menus || []; // returns array of menus, fallback to empty array
    } catch (error) {
      console.error('Error fetching menu access:', error);
      console.error('Error response:', error.response?.data);
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
        state.menus = action.payload || [];
        state.error = null;
        console.log('Menu access loaded successfully:', action.payload);
      })
      .addCase(fetchMenuAccess.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('Menu access fetch failed:', action.payload);
        // Keep existing menus on error to prevent disappearing
      });
  },
});

export default menuAccessSlice.reducer;
