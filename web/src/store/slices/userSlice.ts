import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  interests: string[];
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    privacy: 'public' | 'private' | 'friends';
  };
  stats: {
    eventsAttended: number;
    eventsCreated: number;
    tribesJoined: number;
    tribesCreated: number;
  };
  dna?: any;
}

interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
};

export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async () => {
    const response = await api.get('/api/auth/profile');
    return response.data;
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (profileData: Partial<UserProfile>) => {
    const response = await api.put('/api/auth/profile', profileData);
    return response.data;
  }
);

export const updateUserPreferences = createAsyncThunk(
  'user/updateUserPreferences',
  async (preferences: UserProfile['preferences']) => {
    const response = await api.patch('/api/notifications/preferences', preferences);
    return response.data;
  }
);

export const analyzeUserDNA = createAsyncThunk(
  'user/analyzeUserDNA',
  async () => {
    const response = await api.get('/api/search/analytics');
    return response.data;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user profile';
      })
      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update user profile';
      })
      // Update User Preferences
      .addCase(updateUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        if (state.profile) {
          state.profile.preferences = action.payload.preferences;
        }
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update preferences';
      })
      // Analyze User DNA
      .addCase(analyzeUserDNA.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(analyzeUserDNA.fulfilled, (state, action) => {
        state.loading = false;
        if (state.profile) {
          state.profile.dna = action.payload;
        }
      })
      .addCase(analyzeUserDNA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to analyze user DNA';
      });
  },
});

export const { clearError, updateProfile } = userSlice.actions;
export default userSlice.reducer; 