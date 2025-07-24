import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// GET: All Advances (admin/general)
export const fetchAllAdvances = createAsyncThunk(
  'advance/fetchAllAdvances',
  async (filters = {}, { rejectWithValue }) => {
    try {
      // Construct query parameters including pagination
      const queryParams = new URLSearchParams();

      if (filters.hotel_id) queryParams.append('hotel_id', filters.hotel_id);
      if (filters.employee_id) queryParams.append('employee_id', filters.employee_id);
      if (filters.from_date) queryParams.append('from_date', filters.from_date);
      if (filters.to_date) queryParams.append('to_date', filters.to_date);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.per_page) queryParams.append('per_page', filters.per_page);

      const res = await api.get(`/advances?${queryParams.toString()}`);
      const data = res.data?.data;

      return {
        items: data?.items || data || [],
        total: data?.total || 0,
        page: filters.page || 1,
        perPage: filters.per_page || 20,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// POST: Add Advance
export const addAdvance = createAsyncThunk(
  'advance/addAdvance',
  async (advanceData, { rejectWithValue }) => {
    try {
      const res = await api.post('/advances', advanceData);
      if (res.data?.message === 'Advance created successfully') {
        return res.data.data;
      } else {
        return rejectWithValue(res.data?.message || 'Failed to add advance');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// POST: Update Advance
export const updateAdvance = createAsyncThunk(
  'advance/updateAdvance',
  async (advanceData, { rejectWithValue }) => {
    try {
      const res = await api.post(`/advances/update/${advanceData?.id}`, advanceData);
      if (res.data) {
        return advanceData;
      } else {
        return rejectWithValue(res.data?.message || 'Failed to update advance');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// POST: Delete Advance
export const deleteAdvance = createAsyncThunk(
  'advance/deleteAdvance',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.post(`/advances/delete/${id}`);
      if (res.data?.message === 'Advance deleted successfully') {
        return id;
      } else {
        return rejectWithValue(res.data?.message || 'Failed to delete advance');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const advanceSlice = createSlice({
  name: 'advance',
  initialState: {
    advances: [],
    loading: false,
    filterLoading: false,
    error: null,
    page: 1,
    perPage: 20,
    hasMore: true,
    total: 0,
  },
  reducers: {
    resetAdvances: (state) => {
      state.advances = [];
      state.page = 1;
      state.hasMore = true;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAllAdvances.pending, (state, action) => {
        const isFilteredRequest = Object.keys(action.meta.arg || {}).length > 0;
        const isFirstPage = !action.meta.arg?.page || action.meta.arg.page === 1;

        state.loading = !isFilteredRequest && isFirstPage;
        state.filterLoading = isFilteredRequest && isFirstPage;
        state.error = null;
      })
      .addCase(fetchAllAdvances.fulfilled, (state, action) => {
        const { items, page, total } = action.payload;

        if (page > 1) {
          // Append new items for pagination
          state.advances = [...state.advances, ...items];
        } else {
          // Replace items for first page or filters
          state.advances = items;
        }

        state.page = page;
        state.hasMore = items.length >= state.perPage;
        state.total = total;
        state.loading = false;
        state.filterLoading = false;
      })
      .addCase(fetchAllAdvances.rejected, (state, action) => {
        state.loading = false;
        state.filterLoading = false;
        state.error = action.payload;
      })
      .addCase(addAdvance.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAdvance.fulfilled, (state, action) => {
        state.advances.unshift(action.payload);
        state.loading = false;
      })
      .addCase(addAdvance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAdvance.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdvance.fulfilled, (state, action) => {
        const index = state.advances.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.advances[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateAdvance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteAdvance.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdvance.fulfilled, (state, action) => {
        state.advances = state.advances.filter(a => a.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteAdvance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAdvances } = advanceSlice.actions;
export default advanceSlice.reducer;