import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Get All Expenses
export const fetchExpenses = createAsyncThunk(
  'expense/fetchExpenses',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/expenses');
      return res.data;
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
  },
  reducers: {
    clearSelectedExpense(state) {
      state.selectedExpense = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchExpenses.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.expenses = action.payload;
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

export const { clearSelectedExpense } = expenseSlice.actions;
export default expenseSlice.reducer;
