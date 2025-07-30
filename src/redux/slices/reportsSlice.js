import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../api/axiosInstance"

// Async thunk to fetch reports
export const fetchReports = createAsyncThunk("reports/fetchReports", async (params = {}, { rejectWithValue }) => {
  try {
    console.log("params", params)
    const response = await api.get("/reports", { params })
    console.log("response", response.data)
    return {
      data: response.data.data, // The full response data
      isFiltered: !!params.type, // Flag to indicate if this is a filtered request
    }
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// Async thunk to fetch advance reports
export const fetchAdvanceReports = createAsyncThunk(
  "reports/fetchAdvanceReports",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/advance-reports", { params })
      return {
        data: response.data.data,
        totals: response.data.final_totals,
        currentPage: response.data.pagination.current_page,
        perPage: response.data.pagination.per_page,
        totalItems: response.data.pagination.total,
        isFiltered: !!params.hotel_id || !!params.employee_id || !!params.from_date || !!params.to_date,
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Async thunk to fetch payment reports
export const fetchPaymentReports = createAsyncThunk(
  "reports/fetchPaymentReports",
  async (params = {}, { rejectWithValue }) => {
    try {
      const perPage = params.per_page || 10
      console.log("🔍 Fetching payment reports with params:", params)

      const response = await api.get("/payment-reports", {
        params: {
          page: params.page || 1,
          per_page: perPage,
          hotel_id: params.hotel_id || "",
          platform_id: params.platform_id || "",
          from_date: params.from_date || "",
          to_date: params.to_date || "",
        },
      })

      console.log("📊 Payment reports API response:", {
        page: params.page || 1,
        dataLength: response.data.data?.length || 0,
        data: response.data.data,
        totals: response.data.totals,
      })

      // Better hasMore calculation with debugging
      const receivedItems = response.data.data?.length || 0
      const hasMore = receivedItems === perPage

      console.log("📈 HasMore calculation:", {
        receivedItems,
        perPage,
        hasMore,
        calculation: `${receivedItems} === ${perPage} = ${hasMore}`,
      })

      return {
        data: response.data.data || [],
        totals: response.data.totals || { total_credit: 0, total_debit: 0, balance: 0 },
        page: params.page || 1,
        hasMore,
        isFiltered: !!params.platform_id || !!params.hotel_id || !!params.from_date || !!params.to_date,
      }
    } catch (error) {
      console.error("❌ Payment reports fetch error:", error)
      return rejectWithValue(error.message)
    }
  },
)

// Async thunk to fetch material request reports
export const fetchMaterialRequestReports = createAsyncThunk(
  "reports/fetchMaterialRequestReports",
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log("params fetchMaterialRequestReports-->", params)
      const perPage = params.per_page || 10
      const response = await api.get("/material-request-reports", {
        params: {
          page: params.page || 1,
          per_page: perPage,
          hotel_id: params.hotel_id || "",
          material_id: params.material_id || "",
        },
      })

      const hasMore = response.data.data.length === perPage

      return {
        data: response.data.data,
        totals: response.data.grand_totals,
        page: params.page || 1,
        hasMore,
        isFiltered: !!params.material_id,
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Define the initial state
const initialState = {
  reports: null,
  advanceReports: [],
  loading: false,
  error: null,
  currentPage: 1,
  perPage: 10,
  totalItems: 0,
  hasMore: true,
  paymentReports: [],
  paymentReportPage: 1,
  paymentReportHasMore: true,
  materialRequestReports: [],
  materialRequestReportTotals: {
    total_instock: 0,
    total_used: 0,
    remaining: 0,
  },
  materialRequestPage: 1,
  materialRequestHasMore: true,
  loading: false,
  error: null,
  selectedType: "all",
  isFiltered: false,
  advanceReportTotals: {
    total_credit: 0,
    total_debit: 0,
    balance: 0,
  },
  paymentReportTotals: {
    total_credit: 0,
    total_debit: 0,
    balance: 0,
  },
  materialRequestReportTotals: {
    total_instock: 0,
    total_used: 0,
    remaining: 0,
  },
}

// Create the slice
const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    setSelectedType: (state, action) => {
      state.selectedType = action.payload
    },
    resetPaymentReports: (state) => {
      console.log("🔄 Resetting payment reports")
      state.paymentReports = []
      state.paymentReportPage = 1
      state.paymentReportHasMore = true
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false
        if (Array.isArray(action.payload.data)) {
          const type = action.meta.arg.type
          state.reports = { [type]: action.payload.data }
        } else {
          state.reports = action.payload.data
        }
        state.isFiltered = action.payload.isFiltered
        if (action.payload.isFiltered && action.meta.arg.type) {
          state.selectedType = action.meta.arg.type
        }
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to load reports"
      })
      .addCase(fetchAdvanceReports.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAdvanceReports.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.currentPage === 1 || action.payload.isFiltered) {
          state.advanceReports = action.payload.data
        } else {
          state.advanceReports = [...state.advanceReports, ...action.payload.data]
        }
        state.advanceReportTotals = action.payload.totals
        state.currentPage = action.payload.currentPage
        state.perPage = action.payload.perPage
        state.totalItems = action.payload.totalItems
        state.hasMore = action.payload.currentPage * action.payload.perPage < action.payload.totalItems
      })
      .addCase(fetchAdvanceReports.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to load advance reports"
      })
      .addCase(fetchPaymentReports.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPaymentReports.fulfilled, (state, action) => {
        console.log("🎯 Payment reports fulfilled:", {
          currentPage: action.payload.page,
          newDataLength: action.payload.data?.length || 0,
          currentReportsLength: state.paymentReports.length,
          hasMore: action.payload.hasMore,
        })

        state.loading = false

        if (action.payload.page === 1) {
          // First page - replace data
          console.log("📝 Replacing data for page 1")
          state.paymentReports = action.payload.data || []
        } else {
          // Subsequent pages - append new data
          const newData = action.payload.data || []
          console.log("📝 Appending data for page", action.payload.page, {
            existingCount: state.paymentReports.length,
            newCount: newData.length,
            totalAfterAppend: state.paymentReports.length + newData.length,
          })
          state.paymentReports = [...state.paymentReports, ...newData]
        }

        state.paymentReportTotals = action.payload.totals || { total_credit: 0, total_debit: 0, balance: 0 }
        state.paymentReportPage = action.payload.page
        state.paymentReportHasMore = action.payload.hasMore
        state.isFiltered = action.payload.isFiltered

        console.log("✅ Final state after update:", {
          totalReports: state.paymentReports.length,
          currentPage: state.paymentReportPage,
          hasMore: state.paymentReportHasMore,
        })
      })
      .addCase(fetchPaymentReports.rejected, (state, action) => {
        console.error("❌ Payment reports rejected:", action.payload)
        state.loading = false
        state.error = action.payload || "Failed to load payment reports"
      })
      .addCase(fetchMaterialRequestReports.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMaterialRequestReports.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.page === 1) {
          state.materialRequestReports = action.payload.data
        } else {
          state.materialRequestReports = [...state.materialRequestReports, ...action.payload.data]
        }
        state.materialRequestReportTotals = action.payload.totals
        state.materialRequestPage = action.payload.page
        state.materialRequestHasMore = action.payload.hasMore
      })
      .addCase(fetchMaterialRequestReports.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to load material request reports"
      })
  },
})

export const { setSelectedType, resetPaymentReports } = reportsSlice.actions
export default reportsSlice.reducer
