import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance'; // The axios instance with your baseURL

// Fetch All Materials
export const fetchAllMaterials = createAsyncThunk(
  'material/fetchAllMaterials',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('material-requests');

      // Log the entire response to check its structure
      console.log('API Response:', res.data);

      if (res.data) {
        return res.data; // Return the array of materials
      } else {
        return rejectWithValue(res.data?.message || 'Failed to fetch materials');
      }
    } catch (error) {
      console.error('Error:', error);
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);


// Add Material
export const addMaterial = createAsyncThunk(
  'material/addMaterial',
  async (materialData, { rejectWithValue }) => {
    console.log(" materialData", materialData);

    try {
      const res = await api.post(`material-requests`, materialData);

      console.log('API Response:', res.data);

      if (res.data?.message === 'Material request created') {

        console.log("res.data.message", res.data.message);
        return { message: res.data.message };

        // Return the success message or any other relevant info
      } else {
        return rejectWithValue(res.data?.message || 'Failed to add material');
      }
    } catch (error) {
      console.error('Error:', error);
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

// Update Material
export const updateMaterial = createAsyncThunk(
  'material/updateMaterial',
  async (materialData, { rejectWithValue }) => {
    console.log("Updated material data --->", materialData);

    try {
      const res = await api.post(`material-requests/${materialData?.id}/update`, materialData);

      if (res.data?.status === 'success') {
        return { message: res.data.message, updatedMaterial: materialData }; // Return the updated material info manually
      } else {
        return rejectWithValue(res.data?.message || 'Failed to update material');
      }
    } catch (error) {
      console.error('Error:', error);
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

// Delete Material
export const deleteMaterial = createAsyncThunk(
  'material/deleteMaterial',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.post(`material-requests/${id}/delete`);
      console.log("sdfghgfdsfgf", res)
      if (res.data.status === 'success') {
        return { message: res.data.status }; // Return the id of the deleted material
      } else {
        return rejectWithValue(res?.data.message || 'Failed to delete material');
      }
    } catch (error) {
      console.error('Errorssss:', error);
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

// Initial State
const initialState = {
  materials: [],
  material: null,
  loading: false,
  error: null,
};

// Slice for Material CRUD
const materialSlice = createSlice({
  name: 'material',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch All Materials
      .addCase(fetchAllMaterials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllMaterials.fulfilled, (state, action) => {
        state.loading = false;
        state.materials = action.payload; // Store the fetched materials
      })
      .addCase(fetchAllMaterials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Handle error if fetching fails
      })

      // Add Material
      .addCase(addMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMaterial.fulfilled, (state, action) => {
        state.loading = false;
        // You can handle the success message here or log it
        if (action.payload?.message) {
          console.log('Material Added:', action.payload.message);
        }
      })
      .addCase(addMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMaterial.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.message) {
          // Find the index of the material being updated and replace it in the list
          const index = state.materials.findIndex(item => item.id === action.payload.updatedMaterial.id);
          if (index !== -1) {
            state.materials[index] = action.payload.updatedMaterial; // Update the material
          }
        }
      })
      .addCase(updateMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Material
      .addCase(deleteMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMaterial.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the deleted material from the list
        state.materials = state.materials.filter(item => item.id !== action.payload.id);
      })
      .addCase(deleteMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

  },
});

export default materialSlice.reducer;
