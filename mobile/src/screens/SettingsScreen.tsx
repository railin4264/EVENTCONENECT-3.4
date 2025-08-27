import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Settings, User, Bell, Shield, Globe, Palette, 
  Download, Upload, HelpCircle, Info, LogOut, Trash2
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { colors, theme, setTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar Cuenta',
      'Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar tu cuenta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => {
          Alert.alert('Info', 'Función de eliminación de cuenta en desarrollo');
        }},
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Info', 'Función de exportación de datos en desarrollo');
  };

  const handleImportData = () => {
    Alert.alert('Info', 'Función de importación de datos en desarrollo');
  };

  const handleBackup = () => {
    Alert.alert('Info', 'Función de respaldo en desarrollo');
  };

  const handleRestore = () => {
    Alert.alert('Info', 'Función de restauración en desarrollo');
  };

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode,
    showArrow: boolean = true
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.settingItemRight}>
        {rightElement}
        {showArrow && onPress && (
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSwitch = (value: boolean, onValueChange: (value: boolean) => void) => (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.border, true: colors.primary + '40' }}
      thumbColor={value ? colors.primary : colors.textSecondary}
    />
  );

  const renderThemeSelector = () => (
    <View style={styles.themeSelector}>
      {[
        { id: 'light', label: 'Claro', icon: 'sunny' },
        { id: 'dark', label: 'Oscuro', icon: 'moon' },
        { id: 'system', label: 'Sistema', icon: 'settings' },
      ].map((themeOption) => (
        <TouchableOpacity
          key={themeOption.id}
          style={[
            styles.themeOption,
            theme === themeOption.id && { backgroundColor: colors.primary + '20' }
          ]}
          onPress={() => setTheme(themeOption.id as any)}
        >
          <Ionicons
            name={themeOption.icon as any}
            size={20}
            color={theme === themeOption.id ? colors.primary : colors.textSecondary}
          />
          <Text style={[
            styles.themeOptionText,
            { color: theme === themeOption.id ? colors.primary : colors.textSecondary }
          ]}>
            {themeOption.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.profileAvatar} />
              ) : (
                <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.profileInitial}>
                    {user?.firstName?.charAt(0) || user?.username.charAt(0) || 'U'}
                  </Text>
                </View>
              )}
              <View style={styles.profileText}>
                <Text style={[styles.profileName, { color: colors.text }]}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                  {user?.email}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.editProfileButton, { borderColor: colors.primary }]}
              onPress={() => Alert.alert('Info', 'Función de edición de perfil en desarrollo')}
            >
              <Text style={[styles.editProfileButtonText, { color: colors.primary }]}>
                Editar
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Settings */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Configuración de Cuenta
          </Text>
          
          {renderSettingItem(
            <User size={20} color={colors.primary} />,
            'Perfil',
            'Gestiona tu información personal',
            () => navigation.navigate('Profile' as never)
          )}
          
          {renderSettingItem(
            <Shield size={20} color={colors.primary} />,
            'Privacidad y Seguridad',
            'Configura tu privacidad y seguridad',
            () => Alert.alert('Info', 'Función de privacidad en desarrollo')
          )}
          
          {renderSettingItem(
            <Globe size={20} color={colors.primary} />,
            'Idioma',
            'Español',
            () => Alert.alert('Info', 'Función de cambio de idioma en desarrollo')
          )}
        </View>

        {/* Notifications */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Notificaciones
          </Text>
          
          {renderSettingItem(
            <Bell size={20} color={colors.primary} />,
            'Notificaciones Push',
            'Recibe notificaciones en tiempo real',
            undefined,
            renderSwitch(pushNotifications, setPushNotifications),
            false
          )}
          
          {renderSettingItem(
            <Bell size={20} color={colors.primary} />,
            'Notificaciones por Email',
            'Recibe notificaciones por correo electrónico',
            undefined,
            renderSwitch(emailNotifications, setEmailNotifications),
            false
          )}
          
          {renderSettingItem(
            <Bell size={20} color={colors.primary} />,
            'Notificaciones de Eventos',
            'Recibe notificaciones sobre eventos',
            undefined,
            renderSwitch(notificationsEnabled, setNotificationsEnabled),
            false
          )}
        </View>

        {/* Appearance */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Apariencia
          </Text>
          
          {renderSettingItem(
            <Palette size={20} color={colors.primary} />,
            'Tema',
            'Personaliza la apariencia de la app',
            undefined,
            undefined,
            false
          )}
          
          {renderThemeSelector()}
        </View>

        {/* Privacy & Data */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Privacidad y Datos
          </Text>
          
          {renderSettingItem(
            <Shield size={20} color={colors.primary} />,
            'Servicios de Ubicación',
            'Permite que la app acceda a tu ubicación',
            undefined,
            renderSwitch(locationServices, setLocationServices),
            false
          )}
          
          {renderSettingItem(
            <Shield size={20} color={colors.primary} />,
            'Analytics y Mejoras',
            'Ayuda a mejorar la app con datos de uso',
            undefined,
            renderSwitch(analyticsEnabled, setAnalyticsEnabled),
            false
          )}
          
          {renderSettingItem(
            <Download size={20} color={colors.primary} />,
            'Exportar Datos',
            'Descarga una copia de tus datos',
            handleExportData
          )}
          
          {renderSettingItem(
            <Upload size={20} color={colors.primary} />,
            'Importar Datos',
            'Importa datos desde otro dispositivo',
            handleImportData
          )}
        </View>

        {/* Backup & Sync */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Respaldo y Sincronización
          </Text>
          
          {renderSettingItem(
            <Download size={20} color={colors.primary} />,
            'Crear Respaldo',
            'Guarda una copia de seguridad',
            handleBackup
          )}
          
          {renderSettingItem(
            <Upload size={20} color={colors.primary} />,
            'Restaurar Respaldo',
            'Restaura desde una copia de seguridad',
            handleRestore
          )}
        </View>

        {/* Help & Support */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Ayuda y Soporte
          </Text>
          
          {renderSettingItem(
            <HelpCircle size={20} color={colors.primary} />,
            'Centro de Ayuda',
            'Encuentra respuestas a tus preguntas',
            () => Alert.alert('Info', 'Centro de ayuda en desarrollo')
          )}
          
          {renderSettingItem(
            <Info size={20} color={colors.primary} />,
            'Acerca de EventConnect',
            'Información de la aplicación',
            () => Alert.alert('Info', 'Información de la app en desarrollo')
          )}
          
          {renderSettingItem(
            <Info size={20} color={colors.primary} />,
            'Términos y Condiciones',
            'Lee nuestros términos de servicio',
            () => Alert.alert('Info', 'Términos y condiciones en desarrollo')
          )}
          
          {renderSettingItem(
            <Info size={20} color={colors.primary} />,
            'Política de Privacidad',
            'Lee nuestra política de privacidad',
            () => Alert.alert('Info', 'Política de privacidad en desarrollo')
          )}
        </View>

        {/* Account Actions */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Acciones de Cuenta
          </Text>
          
          {renderSettingItem(
            <LogOut size={20} color={colors.error} />,
            'Cerrar Sesión',
            'Cierra tu sesión actual',
            handleLogout,
            undefined,
            false
          )}
          
          {renderSettingItem(
            <Trash2 size={20} color={colors.error} />,
            'Eliminar Cuenta',
            'Elimina permanentemente tu cuenta',
            handleDeleteAccount,
            undefined,
            false
          )}
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            EventConnect v1.0.0
          </Text>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            © 2024 EventConnect. Todos los derechos reservados.
          </Text>
        </View>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInitial: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  editProfileButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  editProfileButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  versionText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  bottomSpacing: {
    height: 100,
  },
});
