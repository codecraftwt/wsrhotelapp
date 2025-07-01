import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Login Thunk
export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const res = await api.post('/login.php', { username, password });

      console.log('Response from API call --->', res.data);

      if (res.data?.status === 'success' && res.data?.user) {
        return {
          user: res.data.user,
          token: res.data.token || null,
        };
      } else {
        return rejectWithValue(res.data?.message || 'Login failed');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  },
);

// Register Thunk
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post('/register.php', userData);

      if (res.data?.status === 'success' && res.data?.user) {
        return {
          user: res.data.user,
          token: res.data.token || null,
        };
      } else {
        return rejectWithValue(res.data?.message || 'Registration failed');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  },
);

// Initial State
const initialState = {
  user: null,
  token: null,
  isLoggedIn: false,
  loading: false,
  error: null,
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Login
      .addCase(login.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoggedIn = true;
        state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Register
      .addCase(register.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoggedIn = true;
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
