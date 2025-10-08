// src/redux/slices/userSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to create a new user
export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      console.log("userData ---", userData);
      
      const response = await axios.post(
        // 'https://orange-cat-558017.hostingersite.com/api/users',
        'https://api-multihotel.walstarscastleview.com/api/users',
        userData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log("User created --->", response.data);
      return response.data;
      
      
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    loading: false,
    error: null,
    success: false,
    createdUser: null,
  },
  reducers: {
    resetUserState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.createdUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.createdUser = action.payload;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create user';
      });
  },
});

export const { resetUserState } = userSlice.actions;
export default userSlice.reducer;
