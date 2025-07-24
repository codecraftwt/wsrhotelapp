import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

// Fetch All Material Items
export const fetchMaterialItems = createAsyncThunk(
  'materialItems/fetchMaterialItems',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('materials');
      console.log("res", res)
      return res.data?.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  },
);

// Add Material Item
export const addMaterialItem = createAsyncThunk(
  'materialItems/addMaterialItem',
  async (materialItemData, { rejectWithValue }) => {
    console.log("Material item data --->", materialItemData);
    try {
      const res = await api.post('materials', materialItemData);
      console.log("Added material --->", res.data);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  },
);

// Edit Material Item
export const editMaterialItem = createAsyncThunk(
  'materialItems/editMaterialItem',
  async (materialItemData, { rejectWithValue }) => {
    try {
      console.log("materialItemData", materialItemData)
      const res = await api.post(`materials/${materialItemData.id}/update`, materialItemData);
      console.log("materialItemData", res.data)

      if (res.data?.message === 'Material updated') {
        return res.data.data;
      } else {
        return rejectWithValue(res.data?.message || 'Failed to update material item');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

// Delete Material Item
export const deleteMaterialItem = createAsyncThunk(
  'materialItems/deleteMaterialItem',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.post(`materials/${id}/delete`);
      console.log("deleteMaterialItem", res.data)
      if (res.data?.message === 'Material deleted') {
        return { id };
      } else {
        return rejectWithValue(res.data?.message || 'Failed to delete  material item');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

// Initial State
const initialState = {
  materialItems: [],
  loading: false,
  error: null,
};

// Slice
const materialItemsSlice = createSlice({
  name: 'materialItems',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // Fetch Material Items
      .addCase(fetchMaterialItems.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaterialItems.fulfilled, (state, action) => {
        state.materialItems = action.payload;
        state.loading = false;
      })
      .addCase(fetchMaterialItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Material Item
      .addCase(addMaterialItem.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMaterialItem.fulfilled, (state, action) => {
        state.materialItems = [action.payload, ...state.materialItems]; // Add to beginning
        state.loading = false;
        state.error = null;
      })
      .addCase(addMaterialItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Edit Material Item
      .addCase(editMaterialItem.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editMaterialItem.fulfilled, (state, action) => {
        const updated = action.payload;
        state.materialItems = state.materialItems.map(item =>
          item.id === updated.id ? updated : item
        );
        state.loading = false;
        state.error = null;
      })
      .addCase(editMaterialItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Material Item
      .addCase(deleteMaterialItem.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMaterialItem.fulfilled, (state, action) => {
        state.materialItems = state.materialItems.filter(item => item.id !== action.payload.id);
        state.loading = false;
      })
      .addCase(deleteMaterialItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default materialItemsSlice.reducer;
