import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';
import Toast from 'react-native-toast-message';
import { Alert } from 'react-native';

// Fetch Employees
export const fetchEmployees = createAsyncThunk(
  'employee/fetchEmployees',
  async (filters = {}, { rejectWithValue }) => {
    try {
      console.log("Request filters:", filters);
      const response = await api.get('employees', {
        params: {
          page: filters.page,
          per_page: filters.per_page,
          search: filters.search,
        }
      });
      console.log("API response fetchEmployees:", response.data);

      // Extract the data from response based on your API structure
      const responseData = response.data.data; // Array of employees
      const totalItems = response.data.totalItems;
      const perPage = filters.per_page || 20;

      return {
        items: responseData || [], // Ensure we always return an array
        total: totalItems || 0,
        page: filters.page || 1,
        perPage: perPage,
      };
    } catch (error) {
      console.error("Error fetching employees:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
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
      console.log("errorww", error.response.data.error)
      for (const field in error.response.data.error) {
        if (error.response.data.error.hasOwnProperty(field)) {
          console.log(`${field} error:`, error.response.data.error[field][0]);
          rejectWithValue(error.response.data.error[field][0])
          Alert.alert(
            `${field.charAt(0).toUpperCase() + field.slice(1)} Error`, // Title
            error[field][0], // Message
            [
              { text: 'OK', onPress: () => console.log('OK Pressed') }, // First button
              { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' } // Second button (Cancel)
            ]
          );
        }
      }

      if (error.response && error.response.data && error.response.data.error) {
        const errorMessages = error.response.data.error;
        return rejectWithValue(errorMessages); // Pass the error object directly to the state
      }
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
  page: 1,
  perPage: 20,
  hasMore: true,
};

// Slice
const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    resetEmployees(state) {
      state.employees = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch
      .addCase(fetchEmployees.pending, (state, action) => {
        // Only set loading true if it's the first page
        if (action.meta.arg.page === 1) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        const { items, page } = action.payload;
        state.loading = false;

        if (page === 1) {
          state.employees = items;
        } else {
          // Filter out duplicates before adding
          const newItems = items.filter(newItem =>
            !state.employees.some(existing => existing.id === newItem.id)
          );
          state.employees = [...state.employees, ...newItems];
        }

        state.page = page;
        state.hasMore = items.length === state.perPage;
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
export const { resetEmployees } = employeeSlice.actions;

export default employeeSlice.reducer;
