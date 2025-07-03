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

// Verify Token Thunk
export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      
      if (!token) {
        return rejectWithValue('No token found');
      }

      // Set the token in axios headers for this request
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const res = await api.post('/verify-token.php', { token });
      
      if (res.data?.status === 'success') {
        return {
          user: res.data.user,
          token: token,
        };
      } else {
        return rejectWithValue('Token verification failed');
      }
    } catch (error) {
      return rejectWithValue('Token verification failed');
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
  isInitialized: false, // Add this to track if auth state has been initialized
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
    setInitialized(state) {
      state.isInitialized = true;
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
        state.isInitialized = true;
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
        state.isInitialized = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Verify Token
      .addCase(verifyToken.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoggedIn = true;
        state.loading = false;
        state.isInitialized = true;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.isLoggedIn = false;
        state.error = action.payload;
        state.loading = false;
        state.isInitialized = true;
      });
  },
});

export const { logout, setInitialized } = authSlice.actions;
export default authSlice.reducer;
