import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  category: string;
  image?: string;
  organizer: {
    id: string;
    name: string;
    avatar?: string;
  };
  attendees: number;
  maxAttendees: number;
  price: number;
  tags: string[];
  isActive: boolean;
}

interface EventsState {
  events: Event[];
  currentEvent: Event | null;
  loading: boolean;
  error: string | null;
  filters: {
    category: string;
    location: string;
    date: string;
    price: string;
  };
}

const initialState: EventsState = {
  events: [],
  currentEvent: null,
  loading: false,
  error: null,
  filters: {
    category: '',
    location: '',
    date: '',
    price: '',
  },
};

export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (params?: { category?: string; location?: string; date?: string }) => {
    const response = await api.get('/events', { params });
    return response.data;
  }
);

export const fetchEventById = createAsyncThunk(
  'events/fetchEventById',
  async (id: string) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData: Partial<Event>) => {
    const response = await api.post('/events', eventData);
    return response.data;
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ id, data }: { id: string; data: Partial<Event> }) => {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  }
);

export const joinEvent = createAsyncThunk(
  'events/joinEvent',
  async (eventId: string) => {
    const response = await api.post(`/events/${eventId}/join`);
    return response.data;
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<EventsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        location: '',
        date: '',
        price: '',
      };
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentEvent: (state, action: PayloadAction<Event | null>) => {
      state.currentEvent = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Events
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch events';
      })
      // Fetch Event by ID
      .addCase(fetchEventById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch event';
      })
      // Create Event
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events.unshift(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create event';
      })
      // Update Event
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.events.findIndex(event => event.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
        if (state.currentEvent?.id === action.payload.id) {
          state.currentEvent = action.payload;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update event';
      })
      // Join Event
      .addCase(joinEvent.fulfilled, (state, action) => {
        const event = state.events.find(e => e.id === action.payload.eventId);
        if (event) {
          event.attendees = action.payload.attendees;
        }
        if (state.currentEvent?.id === action.payload.eventId) {
          state.currentEvent.attendees = action.payload.attendees;
        }
      });
  },
});

export const { setFilters, clearFilters, clearError, setCurrentEvent } = eventsSlice.actions;
export default eventsSlice.reducer; 