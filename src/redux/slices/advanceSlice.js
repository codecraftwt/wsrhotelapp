import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// GET: All Advances for a Specific Employee
export const fetchAdvancesByEmployee = createAsyncThunk(
  'advance/fetchAdvancesByEmployee',
  async (employee_id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/get-hotel-employees?hotel_id=${employee_id}`);
      console.log("Hotel id -->", res.data);

      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// GET: All Advances (admin/general)
export const fetchAllAdvances = createAsyncThunk(
  'advance/fetchAllAdvances',
  async (filters = {}, { rejectWithValue }) => {
    try {
      // Construct query parameters based on provided filters
      const queryParams = new URLSearchParams();

      if (filters.hotel_id) queryParams.append('hotel_id', filters.hotel_id);
      if (filters.employee_id) queryParams.append('employee_id', filters.employee_id);
      if (filters.from_date) queryParams.append('from_date', filters.from_date);
      if (filters.to_date) queryParams.append('to_date', filters.to_date);

      const res = await api.get(`/advances?${queryParams.toString()}`);
      console.log("Advances data --->", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// POST: Add Advance
export const addAdvance = createAsyncThunk(
  'advance/addAdvance',
  async (advanceData, { rejectWithValue }) => {
    console.log("advanceData --->", advanceData);

    try {
      const res = await api.post('/advances', advanceData);
      if (res.data?.message === 'Advance created successfully') {
        return res.data.data
      } else {
        return rejectWithValue(res.data?.message || 'Failed to add advance');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// POST: Update Advance
export const updateAdvance = createAsyncThunk(
  'advance/updateAdvance',
  async (advanceData, { rejectWithValue }) => {
    try {
      console.log("Advance data for update -------->", advanceData)
      const res = await api.put(`/advances/${advanceData?.id}`, advanceData);
      if (res.data) {
        return advanceData;
      } else {
        return rejectWithValue(res.data?.message || 'Failed to update advance');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
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
  },
);

// Slice
const advanceSlice = createSlice({
  name: 'advance',
  initialState: {
    advances: [],
    loading: false,
    filterLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchAllAdvances.pending, (state, action) => {
        // Check if this is a filtered request
        const isFilteredRequest = Object.keys(action.meta.arg || {}).length > 0;
        state.loading = !isFilteredRequest;
        state.filterLoading = isFilteredRequest;
        state.error = null;
      })
      .addCase(fetchAllAdvances.fulfilled, (state, action) => {
        state.advances = action.payload;
        state.loading = false;
        state.filterLoading = false;
      })
      .addCase(fetchAllAdvances.rejected, (state, action) => {
        state.loading = false;
        state.filterLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchAdvancesByEmployee.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdvancesByEmployee.fulfilled, (state, action) => {
        state.advances = action.payload;
        state.loading = false;
      })
      .addCase(fetchAdvancesByEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addAdvance.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAdvance.fulfilled, (state, action) => {
        state.advances.push(action.payload);
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

export default advanceSlice.reducer;
