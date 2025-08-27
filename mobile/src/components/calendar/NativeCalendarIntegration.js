import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Alert, 
  Platform, 
  Linking, 
  StyleSheet,
  TouchableOpacity,
  Switch 
} from 'react-native';
import * as Calendar from 'expo-calendar';
import * as Permissions from 'expo-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

class NativeCalendarManager {
  constructor() {
    this.defaultCalendar = null;
    this.eventConnectCalendar = null;
    this.isInitialized = false;
  }

  // Inicializar el manager de calendario
  async initialize() {
    try {
      if (this.isInitialized) return true;

      const { status } = await Calendar.requestCalendarPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos de Calendario',
          'Para agregar eventos a tu calendario necesitamos permisos de acceso.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configuración', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }

      // Buscar o crear calendario de EventConnect
      await this.setupEventConnectCalendar();
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing calendar:', error);
      return false;
    }
  }

  // Configurar calendario específico de EventConnect
  async setupEventConnectCalendar() {
    try {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      
      // Buscar calendario existente de EventConnect
      const existingCalendar = calendars.find(cal => cal.title === 'EventConnect');
      
      if (existingCalendar) {
        this.eventConnectCalendar = existingCalendar;
        return existingCalendar;
      }

      // Crear nuevo calendario para EventConnect
      const defaultCalendarSource = Platform.select({
        ios: calendars.find(cal => cal.source.name === 'Default'),
        android: { isLocalAccount: true, name: 'EventConnect' }
      });

      const calendarId = await Calendar.createCalendarAsync({
        title: 'EventConnect',
        color: '#FF6B6B',
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: defaultCalendarSource?.id || defaultCalendarSource?.source?.id,
        source: defaultCalendarSource?.source || defaultCalendarSource,
        name: 'EventConnect',
        ownerAccount: 'personal',
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      });

      const createdCalendar = await Calendar.getCalendarAsync(calendarId);
      this.eventConnectCalendar = createdCalendar;
      
      return createdCalendar;
    } catch (error) {
      console.error('Error setting up EventConnect calendar:', error);
      // Fallback al calendario por defecto
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      this.defaultCalendar = calendars.find(cal => cal.allowsModifications) || calendars[0];
      return this.defaultCalendar;
    }
  }

  // Agregar evento al calendario nativo
  async addEventToCalendar(eventData) {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) return null;
      }

      const calendar = this.eventConnectCalendar || this.defaultCalendar;
      if (!calendar) {
        throw new Error('No hay calendario disponible');
      }

      const eventDetails = {
        title: eventData.title,
        notes: eventData.description,
        startDate: new Date(eventData.dateTime.start),
        endDate: new Date(eventData.dateTime.end),
        location: eventData.location?.address ? 
          `${eventData.location.address.street}, ${eventData.location.address.city}, ${eventData.location.address.country}` :
          eventData.location?.name || '',
        calendarId: calendar.id,
        alarms: [
          { relativeOffset: -15 }, // 15 minutos antes
          { relativeOffset: -60 }, // 1 hora antes
        ],
      };

      // Agregar URL del evento en las notas
      if (eventData._id) {
        eventDetails.notes += `\n\nVer en EventConnect: ${process.env.EXPO_PUBLIC_WEB_URL}/events/${eventData._id}`;
      }

      const eventId = await Calendar.createEventAsync(calendar.id, eventDetails);
      
      // Guardar referencia del evento
      await this.saveEventReference(eventData._id, eventId);
      
      return eventId;
    } catch (error) {
      console.error('Error adding event to calendar:', error);
      throw error;
    }
  }

  // Actualizar evento en el calendario
  async updateEventInCalendar(eventId, eventData) {
    try {
      const nativeEventId = await this.getEventReference(eventId);
      if (!nativeEventId) {
        // Si no existe, crear nuevo
        return await this.addEventToCalendar(eventData);
      }

      const eventDetails = {
        title: eventData.title,
        notes: eventData.description,
        startDate: new Date(eventData.dateTime.start),
        endDate: new Date(eventData.dateTime.end),
        location: eventData.location?.address ? 
          `${eventData.location.address.street}, ${eventData.location.address.city}` :
          eventData.location?.name || '',
      };

      await Calendar.updateEventAsync(nativeEventId, eventDetails);
      return nativeEventId;
    } catch (error) {
      console.error('Error updating event in calendar:', error);
      throw error;
    }
  }

  // Eliminar evento del calendario
  async removeEventFromCalendar(eventId) {
    try {
      const nativeEventId = await this.getEventReference(eventId);
      if (!nativeEventId) return;

      await Calendar.deleteEventAsync(nativeEventId);
      await this.removeEventReference(eventId);
    } catch (error) {
      console.error('Error removing event from calendar:', error);
      throw error;
    }
  }

  // Buscar eventos en el calendario nativo
  async getEventsFromCalendar(startDate, endDate) {
    try {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const calendarIds = calendars.map(cal => cal.id);

      const events = await Calendar.getEventsAsync(
        calendarIds,
        startDate,
        endDate
      );

      return events;
    } catch (error) {
      console.error('Error getting events from calendar:', error);
      return [];
    }
  }

  // Verificar conflictos de horario
  async checkScheduleConflicts(eventData) {
    try {
      const startDate = new Date(eventData.dateTime.start);
      const endDate = new Date(eventData.dateTime.end);
      
      // Buscar eventos 30 minutos antes y después
      const searchStart = new Date(startDate.getTime() - 30 * 60 * 1000);
      const searchEnd = new Date(endDate.getTime() + 30 * 60 * 1000);

      const existingEvents = await this.getEventsFromCalendar(searchStart, searchEnd);
      
      const conflicts = existingEvents.filter(event => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        
        return (eventStart < endDate && eventEnd > startDate);
      });

      return conflicts;
    } catch (error) {
      console.error('Error checking schedule conflicts:', error);
      return [];
    }
  }

  // Generar recordatorios inteligentes
  async generateSmartReminders(eventData) {
    const reminders = [{ relativeOffset: -15 }]; // Por defecto 15 min

    // Añadir recordatorios basados en el tipo de evento
    if (eventData.category === 'business') {
      reminders.push({ relativeOffset: -60 }); // 1 hora antes
      reminders.push({ relativeOffset: -1440 }); // 1 día antes
    } else if (eventData.category === 'travel') {
      reminders.push({ relativeOffset: -120 }); // 2 horas antes
      reminders.push({ relativeOffset: -2880 }); // 2 días antes
    }

    // Recordatorio basado en la duración
    const duration = new Date(eventData.dateTime.end) - new Date(eventData.dateTime.start);
    const hours = duration / (1000 * 60 * 60);
    
    if (hours > 4) { // Eventos largos
      reminders.push({ relativeOffset: -240 }); // 4 horas antes
    }

    return reminders;
  }

  // Guardar referencia del evento
  async saveEventReference(eventConnectId, nativeEventId) {
    try {
      const references = await AsyncStorage.getItem('calendar_event_references') || '{}';
      const parsedReferences = JSON.parse(references);
      
      parsedReferences[eventConnectId] = nativeEventId;
      
      await AsyncStorage.setItem('calendar_event_references', JSON.stringify(parsedReferences));
    } catch (error) {
      console.error('Error saving event reference:', error);
    }
  }

  // Obtener referencia del evento
  async getEventReference(eventConnectId) {
    try {
      const references = await AsyncStorage.getItem('calendar_event_references') || '{}';
      const parsedReferences = JSON.parse(references);
      
      return parsedReferences[eventConnectId];
    } catch (error) {
      console.error('Error getting event reference:', error);
      return null;
    }
  }

  // Eliminar referencia del evento
  async removeEventReference(eventConnectId) {
    try {
      const references = await AsyncStorage.getItem('calendar_event_references') || '{}';
      const parsedReferences = JSON.parse(references);
      
      delete parsedReferences[eventConnectId];
      
      await AsyncStorage.setItem('calendar_event_references', JSON.stringify(parsedReferences));
    } catch (error) {
      console.error('Error removing event reference:', error);
    }
  }

  // Sincronizar eventos
  async syncEvents(userEvents) {
    try {
      const syncResults = {
        added: 0,
        updated: 0,
        errors: 0
      };

      for (const event of userEvents) {
        try {
          const nativeEventId = await this.getEventReference(event._id);
          
          if (nativeEventId) {
            // Verificar si el evento nativo existe
            try {
              await Calendar.getEventAsync(nativeEventId);
              await this.updateEventInCalendar(event._id, event);
              syncResults.updated++;
            } catch {
              // El evento nativo no existe, crear uno nuevo
              await this.addEventToCalendar(event);
              syncResults.added++;
            }
          } else {
            // Evento nuevo
            await this.addEventToCalendar(event);
            syncResults.added++;
          }
        } catch (error) {
          console.error(`Error syncing event ${event._id}:`, error);
          syncResults.errors++;
        }
      }

      return syncResults;
    } catch (error) {
      console.error('Error syncing events:', error);
      throw error;
    }
  }

  // Obtener configuración de sincronización
  async getSyncSettings() {
    try {
      const settings = await AsyncStorage.getItem('calendar_sync_settings');
      return settings ? JSON.parse(settings) : {
        autoSync: true,
        syncReminders: true,
        syncConflictCheck: true,
        defaultReminderTime: 15
      };
    } catch (error) {
      return {
        autoSync: true,
        syncReminders: true,
        syncConflictCheck: true,
        defaultReminderTime: 15
      };
    }
  }

  // Guardar configuración de sincronización
  async saveSyncSettings(settings) {
    try {
      await AsyncStorage.setItem('calendar_sync_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving sync settings:', error);
    }
  }
}

// Hook para usar el calendario nativo
export const useNativeCalendar = () => {
  const [manager] = useState(() => new NativeCalendarManager());
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [syncSettings, setSyncSettings] = useState(null);

  useEffect(() => {
    const initializeCalendar = async () => {
      const initialized = await manager.initialize();
      setIsInitialized(initialized);
      setHasPermission(initialized);

      const settings = await manager.getSyncSettings();
      setSyncSettings(settings);
    };

    initializeCalendar();
  }, [manager]);

  const addEvent = async (eventData) => {
    if (!hasPermission) {
      throw new Error('No hay permisos de calendario');
    }
    return await manager.addEventToCalendar(eventData);
  };

  const updateEvent = async (eventId, eventData) => {
    return await manager.updateEventInCalendar(eventId, eventData);
  };

  const removeEvent = async (eventId) => {
    return await manager.removeEventFromCalendar(eventId);
  };

  const checkConflicts = async (eventData) => {
    return await manager.checkScheduleConflicts(eventData);
  };

  const syncEvents = async (userEvents) => {
    return await manager.syncEvents(userEvents);
  };

  const updateSyncSettings = async (newSettings) => {
    const updatedSettings = { ...syncSettings, ...newSettings };
    setSyncSettings(updatedSettings);
    await manager.saveSyncSettings(updatedSettings);
  };

  return {
    isInitialized,
    hasPermission,
    syncSettings,
    addEvent,
    updateEvent,
    removeEvent,
    checkConflicts,
    syncEvents,
    updateSyncSettings,
    requestPermission: manager.initialize.bind(manager),
  };
};

// Componente de configuración de calendario
export const CalendarSettings = ({ syncSettings, onUpdateSettings }) => {
  const [localSettings, setLocalSettings] = useState(syncSettings || {});

  useEffect(() => {
    setLocalSettings(syncSettings || {});
  }, [syncSettings]);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onUpdateSettings(newSettings);
  };

  return (
    <View style={styles.settingsContainer}>
      <Text style={styles.sectionTitle}>Configuración de Calendario</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Ionicons name="sync" size={24} color="#666" />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Sincronización automática</Text>
            <Text style={styles.settingDescription}>
              Agregar eventos automáticamente al calendario nativo
            </Text>
          </View>
        </View>
        <Switch
          value={localSettings.autoSync}
          onValueChange={(value) => handleSettingChange('autoSync', value)}
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Ionicons name="alarm" size={24} color="#666" />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Recordatorios</Text>
            <Text style={styles.settingDescription}>
              Incluir recordatorios en eventos del calendario
            </Text>
          </View>
        </View>
        <Switch
          value={localSettings.syncReminders}
          onValueChange={(value) => handleSettingChange('syncReminders', value)}
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Ionicons name="warning" size={24} color="#666" />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Detectar conflictos</Text>
            <Text style={styles.settingDescription}>
              Avisar sobre eventos que se solapan en tiempo
            </Text>
          </View>
        </View>
        <Switch
          value={localSettings.syncConflictCheck}
          onValueChange={(value) => handleSettingChange('syncConflictCheck', value)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  settingsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default NativeCalendarManager;



