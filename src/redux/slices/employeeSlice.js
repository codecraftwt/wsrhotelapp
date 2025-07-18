import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Fetch Employees
export const fetchEmployees = createAsyncThunk(
  'employee/fetchEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('employees');
      if (res.data) {
        console.log("fetchEmployees --------------------", res.data);
        
        return res.data; // assuming employees are in `data`
      } else {
        return rejectWithValue(
          res.data?.message || 'Failed to fetch employees',
        );
      }
    } catch (error) {
      console.log(error)
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
      let res;
      if (employeeData instanceof FormData) {
        // Explicitly set Content-Type for React Native
        res = await api.post('employees', employeeData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        console.log("application/json==============================>")
        res = await api.post('employees', employeeData, {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      console.log('Response after adding employee -->', res.data);
      if (res.data?.message === 'Employee created') {
        return res.data.user; // assuming new employee is returned
      } else {
        return rejectWithValue(res.data?.message || 'Failed to add employee');
      }
    } catch (error) {
      console.log('Error at adding employee --->', error.message);
      console.log('Error at adding employee --->', error.res?.data);
      return rejectWithValue(error.message || 'Something went wrong');
    }
  },
);

// Update Employee
export const updateEmployee = createAsyncThunk(
  'employee/updateEmployee',
  async (employeeData, { rejectWithValue }) => {
    try {
      console.log('Calling updateEmployee API with:', employeeData);
      const res = await api.post(`employees/update/${employeeData.id}`, employeeData);
      console.log('UpdateEmployee API response:', res.data);
      if (res.data?.message === 'Employee updated') {
        return res.data.data; // updated employee
      } else {
        return rejectWithValue(res.data?.message || 'Failed to update employee');
      }
    } catch (error) {
      console.log('Error at updateEmployee:', error.message);
      if (error.response) {
        console.log('Error response data:', error.response.data);
      }
      return rejectWithValue(error.message || 'Something went wrong');
    }
  },
);

// Delete Employee
export const deleteEmployee = createAsyncThunk(
  'employee/deleteEmployee',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.post(`/employees/delete/${id}`);
      console.log("Employee deleted --->", res.data);

      if (res.data?.message === 'Employee deleted') {
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
