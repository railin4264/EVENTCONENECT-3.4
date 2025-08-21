import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

interface Tribe {
  id: string;
  name: string;
  description: string;
  category: string;
  image?: string;
  members: number;
  maxMembers: number;
  isPrivate: boolean;
  tags: string[];
  createdAt: string;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface TribesState {
  tribes: Tribe[];
  currentTribe: Tribe | null;
  loading: boolean;
  error: string | null;
  filters: {
    category: string;
    search: string;
  };
}

const initialState: TribesState = {
  tribes: [],
  currentTribe: null,
  loading: false,
  error: null,
  filters: {
    category: '',
    search: '',
  },
};

export const fetchTribes = createAsyncThunk(
  'tribes/fetchTribes',
  async (params?: { category?: string; search?: string }) => {
    const response = await api.get('/api/tribes', { params });
    return response.data;
  }
);

export const fetchTribeById = createAsyncThunk(
  'tribes/fetchTribeById',
  async (id: string) => {
    const response = await api.get(`/api/tribes/${id}`);
    return response.data;
  }
);

export const createTribe = createAsyncThunk(
  'tribes/createTribe',
  async (tribeData: Partial<Tribe>) => {
    const response = await api.post('/api/tribes', tribeData);
    return response.data;
  }
);

export const joinTribe = createAsyncThunk(
  'tribes/joinTribe',
  async (tribeId: string) => {
    const response = await api.post(`/api/tribes/${tribeId}/join`);
    return response.data;
  }
);

const tribesSlice = createSlice({
  name: 'tribes',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<TribesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        search: '',
      };
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTribe: (state, action: PayloadAction<Tribe | null>) => {
      state.currentTribe = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tribes
      .addCase(fetchTribes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTribes.fulfilled, (state, action) => {
        state.loading = false;
        state.tribes = action.payload;
      })
      .addCase(fetchTribes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tribes';
      })
      // Fetch Tribe by ID
      .addCase(fetchTribeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTribeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTribe = action.payload;
      })
      .addCase(fetchTribeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tribe';
      })
      // Create Tribe
      .addCase(createTribe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTribe.fulfilled, (state, action) => {
        state.loading = false;
        state.tribes.unshift(action.payload);
      })
      .addCase(createTribe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create tribe';
      })
      // Join Tribe
      .addCase(joinTribe.fulfilled, (state, action) => {
        const tribe = state.tribes.find(t => t.id === action.payload.tribeId);
        if (tribe) {
          tribe.members = action.payload.members;
        }
        if (state.currentTribe?.id === action.payload.tribeId) {
          state.currentTribe.members = action.payload.members;
        }
      });
  },
});

export const { setFilters, clearFilters, clearError, setCurrentTribe } = tribesSlice.actions;
export default tribesSlice.reducer; 