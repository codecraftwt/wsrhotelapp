// materialSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance';

export const fetchAllMaterials = createAsyncThunk(
  'materials/fetchAll',
  async (filters = {}, thunkAPI) => {
    try {
      console.log("filters fetchAllMaterials", filters)
      const response = await api.get('material-requests', {
        params: {
          hotel_name: filters.hotel_name,
          status: filters.status,
          from_date: filters.from_date,
          to_date: filters.to_date,
          page: filters.page,
          per_page: filters.per_page,
        }
      });
      const data = response.data?.data;
      return {
        items: data?.items || data || [],
        total: data?.total || 0,
        page: filters.page || 1,
        perPage: filters.per_page || 20,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const addMaterial = createAsyncThunk(
  'material/addMaterial',
  async (materialData, { rejectWithValue }) => {
    try {
      const res = await api.post(`material-requests`, materialData);
      if (res.data?.message === 'Material request created') {
        return { message: res.data.message };
      } else {
        return rejectWithValue(res.data?.message || 'Failed to add material');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

export const updateMaterial = createAsyncThunk(
  'material/updateMaterial',
  async (materialData, { rejectWithValue }) => {
    try {
      const res = await api.post(`material-requests/${materialData?.id}/update`, materialData);
      if (res.data?.status === 'success') {
        return { message: res.data.message, updatedMaterial: materialData };
      } else {
        return rejectWithValue(res.data?.message || 'Failed to update material');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

export const deleteMaterial = createAsyncThunk(
  'material/deleteMaterial',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.post(`material-requests/${id}/delete`);
      if (res.data.status === 'success') {
        return { message: res.data.status, id };
      } else {
        return rejectWithValue(res?.data.message || 'Failed to delete material');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

const initialState = {
  materials: [],
  material: null,
  loading: false,
  error: null,
  page: 1,
  perPage: 20,
  hasMore: true,
};

const materialSlice = createSlice({
  name: 'material',
  initialState,
  reducers: {
    resetMaterials(state) {
      state.materials = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllMaterials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllMaterials.fulfilled, (state, action) => {
        const { items, page, perPage } = action.payload;
        state.loading = false;
        if (page > 1) {
          state.materials = [...state.materials, ...items];
        } else {
          state.materials = items;
        }
        state.page = page;
        state.perPage = perPage;
        state.hasMore = items.length === perPage;
      })
      .addCase(fetchAllMaterials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMaterial.fulfilled, (state) => {
        state.loading = false;
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
        const index = state.materials.findIndex(item => item.id === action.payload.updatedMaterial.id);
        if (index !== -1) {
          state.materials[index] = action.payload.updatedMaterial;
        }
      })
      .addCase(updateMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMaterial.fulfilled, (state, action) => {
        state.loading = false;
        state.materials = state.materials.filter(item => item.id !== action.payload.id);
      })
      .addCase(deleteMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetMaterials } = materialSlice.actions;
export default materialSlice.reducer;