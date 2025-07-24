import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Get All Expenses
export const fetchExpenses = createAsyncThunk(
  'expense/fetchExpenses',
  async (filters = {}, { rejectWithValue }) => {
    try {
      // Map frontend filters to API params
      const params = {};
      if (filters.hotel_name) {
        params.hotel_name = filters.hotel_name;
      }
      if (filters.mode) {
        params.mode = filters.mode;
      }
      if (filters.from_date) {
        params.from_date = filters.from_date;
      }
      if (filters.to_date) {
        params.to_date = filters.to_date;
      }
      // Pagination params
      if (filters.page) {
        params.page = filters.page;
      }
      if (filters.per_page) {
        params.per_page = filters.per_page;
      }
      console.log("Filter -------------------------------", params);

      const res = await api.get('expenses', { params });
      console.log("Expence filterData ---------------", res.data);

      // Expecting API to return { data: { items: [], total: N }, ... }
      return {
        items: res.data?.data?.items || res.data?.data || [],
        total: res.data?.data?.total || 0,
        page: params.page || 1,
        perPage: params.per_page || 20,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Get Single Expense by ID (for editing)
export const fetchExpenseById = createAsyncThunk(
  'expense/fetchExpenseById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/expenses/${id}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Add Expense
export const addExpense = createAsyncThunk(
  'expense/addExpense',
  async (expenseData, { rejectWithValue }) => {
    try {
      console.log(expenseData, 'Expense data <-----------');
      const res = await api.post(`/expenses`, expenseData);
      if (res.data?.message === 'Expense created') {
        return expenseData;
      } else {
        return rejectWithValue(res.data?.message || 'Failed to add expense');
      }
    } catch (error) {
      console.log('Error addin expense ----->', error);
      return rejectWithValue(error.message);
    }
  },
);

// Update Expense
export const updateExpense = createAsyncThunk(
  'expense/updateExpense',
  async (expenseData, { rejectWithValue }) => {
    try {
      const res = await api.post(`/expenses/update/${expenseData?.id}`, expenseData);
      if (res.data?.message === 'Expense updated') {
        return expenseData;
      } else {
        return rejectWithValue(res.data?.message || 'Failed to update expense');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Delete Expense
export const deleteExpense = createAsyncThunk(
  'expense/deleteExpense',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.post(`/expenses/delete/${id}`);
      if (res.data?.message === 'Expense deleted') {
        return id;
      } else {
        return rejectWithValue(res.data?.message || 'Failed to delete expense');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Slice
const expenseSlice = createSlice({
  name: 'expense',
  initialState: {
    expenses: [],
    selectedExpense: null,
    loading: false,
    error: null,
    page: 1,
    perPage: 20,
    hasMore: true,
  },
  reducers: {
    clearSelectedExpense(state) {
      state.selectedExpense = null;
    },
    resetExpenses(state) {
      state.expenses = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchExpenses.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        const { items, page, perPage } = action.payload;
        if (page > 1) {
          state.expenses = [...state.expenses, ...items];
        } else {
          state.expenses = items;
        }
        state.page = page;
        state.perPage = perPage;
        state.hasMore = items.length === perPage;
        state.loading = false;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchExpenseById.fulfilled, (state, action) => {
        state.selectedExpense = action.payload;
      })

      .addCase(addExpense.fulfilled, (state, action) => {
        state.expenses.push(action.payload);
      })

      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
      })

      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(e => e.id !== action.payload);
      });
  },
});

export const { clearSelectedExpense, resetExpenses } = expenseSlice.actions;
export default expenseSlice.reducer;
