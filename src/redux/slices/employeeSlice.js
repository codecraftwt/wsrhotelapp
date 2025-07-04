import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Fetch Employees
export const fetchEmployees = createAsyncThunk(
  'employee/fetchEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/all_employee.php');
      if (res.data?.status === 'success') {
        return res.data.employees; // assuming employees are in `data`
      } else {
        return rejectWithValue(
          res.data?.message || 'Failed to fetch employees',
        );
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  },
);

// Add Employee
export const addEmployee = createAsyncThunk(
  'employee/addEmployee',
  async (employeeData, { rejectWithValue }) => {
    try {
      console.log('Add employee data ---->', employeeData);
      const res = await api.post('/add_employee.php', employeeData);
      console.log('Response after adding employee -->', res);
      if (res.data?.status === 'success') {
        return res.data.user; // assuming new employee is returned
      } else {
        return rejectWithValue(res.data?.message || 'Failed to add employee');
      }
    } catch (error) {
      console.log('Error at adding employee --->', error);
      return rejectWithValue(error.message || 'Something went wrong');
    }
  },
);

// Update Employee
export const updateEmployee = createAsyncThunk(
  'employee/updateEmployee',
  async (employeeData, { rejectWithValue }) => {
    try {
      const res = await api.post('/update_employee.php', employeeData);
      if (res.data?.status === 'success') {
        return res.data.data; // updated employee
      } else {
        return rejectWithValue(
          res.data?.message || 'Failed to update employee',
        );
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  },
);

// Delete Employee
export const deleteEmployee = createAsyncThunk(
  'employee/deleteEmployee',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.post('/delete_employee.php', { id });
      if (res.data?.status === 'success') {
        return { id };
      } else {
        return rejectWithValue(
          res.data?.message || 'Failed to delete employee',
        );
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  },
);

// Initial State
const initialState = {
  employees: [],
  loading: false,
  error: null,
};

// Slice
const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // Fetch
      .addCase(fetchEmployees.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.employees = action.payload;
        state.loading = false;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add
      .addCase(addEmployee.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addEmployee.fulfilled, (state, action) => {
        state.employees.push(action.payload);
        state.loading = false;
      })
      .addCase(addEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Employee
      .addCase(updateEmployee.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.employees.findIndex(e => e.id === updated.id);
        if (index !== -1) {
          state.employees[index] = updated;
        }
        state.loading = false;
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteEmployee.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.filter(
          e => e.id !== action.payload.id,
        );
        state.loading = false;
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default employeeSlice.reducer;
