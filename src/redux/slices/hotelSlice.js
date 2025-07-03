import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Fetch All Hotels
export const fetchHotels = createAsyncThunk(
  'hotel/fetchHotels',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/all_hotels.php');
      if (res.data?.status === 'success') {
        return res.data.hotels; // assuming hotels are inside `data`
      } else {
        return rejectWithValue(res.data?.message || 'Failed to fetch hotels');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  },
);

// Add Hotel
export const addHotel = createAsyncThunk(
  'hotel/addHotel',
  async (hotelData, { rejectWithValue }) => {
    try {
      const res = await api.post('/add_hotel.php', hotelData);
      if (res.data?.status === 'success') {
        return res.data.data; // assuming added hotel is in `data`
      } else {
        return rejectWithValue(res.data?.message || 'Failed to add hotel');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  },
);

// Edit Hotel
export const editHotel = createAsyncThunk(
  'hotel/editHotel',
  async (hotelData, { rejectWithValue }) => {
    try {
      console.log('hotel data in payload -->', hotelData);
      const res = await api.post('/update_hotel.php', hotelData);
      console.log('Response on edit hotel', res);
      if (res.data?.status === 'success') {
        return hotelData; // updated hotel
      } else {
        return rejectWithValue(res.data?.message || 'Failed to edit hotel');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  },
);

// Delete Hotel
export const deleteHotel = createAsyncThunk(
  'hotel/deleteHotel',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.post('/delete_hotel.php', { id });
      if (res.data?.status === 'success') {
        return { id };
      } else {
        return rejectWithValue(res.data?.message || 'Failed to delete hotel');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  },
);

// Initial State
const initialState = {
  hotels: [],
  loading: false,
  error: null,
};

// Slice
const hotelSlice = createSlice({
  name: 'hotel',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // Fetch Hotels
      .addCase(fetchHotels.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.hotels = action.payload;
        state.loading = false;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Hotel
      .addCase(addHotel.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addHotel.fulfilled, (state, action) => {
        state.hotels.push(action.payload);
        state.loading = false;
      })
      .addCase(addHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Edit Hotel
      .addCase(editHotel.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editHotel.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.hotels.findIndex(h => h.id === updated.id);
        if (index !== -1) {
          state.hotels[index] = updated;
        }
        state.loading = false;
      })
      .addCase(editHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Hotel
      .addCase(deleteHotel.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHotel.fulfilled, (state, action) => {
        state.hotels = state.hotels.filter(h => h.id !== action.payload.id);
        state.loading = false;
      })
      .addCase(deleteHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default hotelSlice.reducer;
