'use client';

import React, { useState, useEffect } from 'react';
import { 
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Key,
  Trash2,
  Download,
  Upload,
  LogOut,
  Save,
  RefreshCw,
  Settings as SettingsIcon,
  Camera,
  MapPin,
  Link,
  Instagram,
  Twitter,
  Facebook,
  Moon,
  Sun,
  Monitor,
  Volume2,
  VolumeX,
  Zap,
  Crown,
  CreditCard,
  Check,
  X,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

interface UserSettings {
  profile: {
    name: string;
    email: string;
    username: string;
    bio: string;
    location: string;
    website: string;
    profilePicture: string;
    coverImage: string;
    socialLinks: {
      instagram: string;
      twitter: string;
      facebook: string;
    };
  };
  notifications: {
    email: {
      events: boolean;
      tribes: boolean;
      posts: boolean;
      messages: boolean;
      marketing: boolean;
    };
    push: {
      events: boolean;
      tribes: boolean;
      posts: boolean;
      messages: boolean;
    };
    inApp: {
      sound: boolean;
      desktop: boolean;
      frequency: 'realtime' | 'digest' | 'off';
    };
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showEmail: boolean;
    showLocation: boolean;
    allowMessages: 'everyone' | 'friends' | 'none';
    allowEventInvites: boolean;
    allowTribeInvites: boolean;
    activityStatus: boolean;
    dataCollection: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    emailDigest: 'daily' | 'weekly' | 'monthly' | 'never';
    compactMode: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    loginAlerts: boolean;
    sessionTimeout: number;
  };
  subscription: {
    plan: 'free' | 'premium' | 'pro';
    nextBilling: string;
    features: string[];
  };
}

const SettingsPage = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const sections = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'privacy', label: 'Privacidad', icon: Shield },
    { id: 'appearance', label: 'Apariencia', icon: Palette },
    { id: 'security', label: 'Seguridad', icon: Lock },
    { id: 'subscription', label: 'Suscripción', icon: Crown },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setSettings({
        profile: {
          name: 'María González',
          email: 'maria@example.com',
          username: 'mariag_dev',
          bio: 'Desarrolladora Frontend apasionada por React y el diseño UX.',
          location: 'Madrid, España',
          website: 'https://mariagonzalez.dev',
          profilePicture: 'https://ui-avatars.com/api/?name=Maria Gonzalez&background=67e8f9&color=fff',
          coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200',
          socialLinks: {
            instagram: '@mariag_dev',
            twitter: '@mariagonzalez',
            facebook: 'maria.gonzalez.dev',
          },
        },
        notifications: {
          email: {
            events: true,
            tribes: true,
            posts: false,
            messages: true,
            marketing: false,
          },
          push: {
            events: true,
            tribes: true,
            posts: true,
            messages: true,
          },
          inApp: {
            sound: true,
            desktop: true,
            frequency: 'realtime',
          },
        },
        privacy: {
          profileVisibility: 'public',
          showEmail: false,
          showLocation: true,
          allowMessages: 'everyone',
          allowEventInvites: true,
          allowTribeInvites: true,
          activityStatus: true,
          dataCollection: true,
        },
        appearance: {
          theme: 'system',
          language: 'es',
          timezone: 'Europe/Madrid',
          emailDigest: 'weekly',
          compactMode: false,
        },
        security: {
          twoFactorEnabled: false,
          loginAlerts: true,
          sessionTimeout: 7,
        },
        subscription: {
          plan: 'premium',
          nextBilling: '2024-02-15',
          features: ['Analytics avanzado', 'Eventos ilimitados', 'Soporte prioritario'],
        },
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      // Show success message
    }, 1500);
  };

  const handleUpdateSetting = (section: keyof UserSettings, key: string, value: any) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [key]: value,
      },
    }));
  };

  const handleNestedUpdateSetting = (section: keyof UserSettings, nestedKey: string, key: string, value: any) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [nestedKey]: {
          ...(prev![section] as any)[nestedKey],
          [key]: value,
        },
      },
    }));
  };

  const ProfileSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Información personal
        </h3>
        
        {/* Profile Picture */}
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <img 
              src={settings?.profile.profilePicture} 
              alt="Profile"
              className="w-20 h-20 rounded-full"
            />
            <Button 
              size="sm" 
              variant="outline" 
              className="absolute -bottom-2 -right-2 p-1.5"
            >
              <Camera className="w-3 h-3" />
            </Button>
          </div>
          <div>
            <Button variant="outline" size="sm" className="mr-2">
              <Upload className="w-4 h-4 mr-2" />
              Cambiar foto
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre completo
            </label>
            <Input
              value={settings?.profile.name || ''}
              onChange={(e) => handleUpdateSetting('profile', 'name', e.target.value)}
              placeholder="Tu nombre completo"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de usuario
            </label>
            <Input
              value={settings?.profile.username || ''}
              onChange={(e) => handleUpdateSetting('profile', 'username', e.target.value)}
              placeholder="@username"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={settings?.profile.email || ''}
              onChange={(e) => handleUpdateSetting('profile', 'email', e.target.value)}
              placeholder="tu@email.com"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Biografía
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              rows={3}
              value={settings?.profile.bio || ''}
              onChange={(e) => handleUpdateSetting('profile', 'bio', e.target.value)}
              placeholder="Cuéntanos sobre ti..."
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">
              {settings?.profile.bio?.length || 0}/160 caracteres
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ubicación
            </label>
            <Input
              value={settings?.profile.location || ''}
              onChange={(e) => handleUpdateSetting('profile', 'location', e.target.value)}
              placeholder="Tu ciudad"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sitio web
            </label>
            <Input
              type="url"
              value={settings?.profile.website || ''}
              onChange={(e) => handleUpdateSetting('profile', 'website', e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">
          Redes sociales
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Instagram className="w-4 h-4 inline mr-2 text-pink-500" />
              Instagram
            </label>
            <Input
              value={settings?.profile.socialLinks.instagram || ''}
              onChange={(e) => handleNestedUpdateSetting('profile', 'socialLinks', 'instagram', e.target.value)}
              placeholder="@username"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Twitter className="w-4 h-4 inline mr-2 text-blue-400" />
              Twitter
            </label>
            <Input
              value={settings?.profile.socialLinks.twitter || ''}
              onChange={(e) => handleNestedUpdateSetting('profile', 'socialLinks', 'twitter', e.target.value)}
              placeholder="@username"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Facebook className="w-4 h-4 inline mr-2 text-blue-600" />
              Facebook
            </label>
            <Input
              value={settings?.profile.socialLinks.facebook || ''}
              onChange={(e) => handleNestedUpdateSetting('profile', 'socialLinks', 'facebook', e.target.value)}
              placeholder="username"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const NotificationsSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Notificaciones por email
        </h3>
        <div className="space-y-4">
          {[
            { key: 'events', label: 'Nuevos eventos y actualizaciones' },
            { key: 'tribes', label: 'Actividad en mis tribus' },
            { key: 'posts', label: 'Likes y comentarios en mis posts' },
            { key: 'messages', label: 'Mensajes directos' },
            { key: 'marketing', label: 'Noticias y promociones' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {item.label}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={(settings?.notifications.email as any)?.[item.key] || false}
                  onChange={(e) => handleNestedUpdateSetting('notifications', 'email', item.key, e.target.checked)}
                  className="sr-only"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Notificaciones push
        </h3>
        <div className="space-y-4">
          {[
            { key: 'events', label: 'Recordatorios de eventos' },
            { key: 'tribes', label: 'Nuevas publicaciones en tribus' },
            { key: 'posts', label: 'Interacciones en mis posts' },
            { key: 'messages', label: 'Mensajes nuevos' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {item.label}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={(settings?.notifications.push as any)?.[item.key] || false}
                  onChange={(e) => handleNestedUpdateSetting('notifications', 'push', item.key, e.target.checked)}
                  className="sr-only"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PrivacySection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Configuración de privacidad
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Visibilidad del perfil
            </label>
            <select
              value={settings?.privacy.profileVisibility || 'public'}
              onChange={(e) => handleUpdateSetting('privacy', 'profileVisibility', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="public">Público</option>
              <option value="friends">Solo amigos</option>
              <option value="private">Privado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quién puede enviarte mensajes
            </label>
            <select
              value={settings?.privacy.allowMessages || 'everyone'}
              onChange={(e) => handleUpdateSetting('privacy', 'allowMessages', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="everyone">Cualquiera</option>
              <option value="friends">Solo amigos</option>
              <option value="none">Nadie</option>
            </select>
          </div>

          <div className="space-y-4">
            {[
              { key: 'showEmail', label: 'Mostrar email en perfil público' },
              { key: 'showLocation', label: 'Mostrar ubicación en perfil' },
              { key: 'allowEventInvites', label: 'Permitir invitaciones a eventos' },
              { key: 'allowTribeInvites', label: 'Permitir invitaciones a tribus' },
              { key: 'activityStatus', label: 'Mostrar estado de actividad' },
              { key: 'dataCollection', label: 'Permitir recopilación de datos para analytics' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(settings?.privacy as any)?.[item.key] || false}
                    onChange={(e) => handleUpdateSetting('privacy', item.key, e.target.checked)}
                    className="sr-only"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const AppearanceSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tema y apariencia
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { value: 'light', label: 'Claro', icon: Sun },
            { value: 'dark', label: 'Oscuro', icon: Moon },
            { value: 'system', label: 'Sistema', icon: Monitor },
          ].map((theme) => (
            <div
              key={theme.value}
              onClick={() => handleUpdateSetting('appearance', 'theme', theme.value)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                settings?.appearance.theme === theme.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <theme.icon className="w-6 h-6 mx-auto mb-2 text-gray-700 dark:text-gray-300" />
              <p className="text-sm text-center text-gray-700 dark:text-gray-300">
                {theme.label}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Idioma
            </label>
            <select
              value={settings?.appearance.language || 'es'}
              onChange={(e) => handleUpdateSetting('appearance', 'language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Zona horaria
            </label>
            <select
              value={settings?.appearance.timezone || 'Europe/Madrid'}
              onChange={(e) => handleUpdateSetting('appearance', 'timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="Europe/Madrid">Madrid (UTC+1)</option>
              <option value="Europe/London">Londres (UTC+0)</option>
              <option value="America/New_York">Nueva York (UTC-5)</option>
              <option value="America/Los_Angeles">Los Ángeles (UTC-8)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Modo compacto
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings?.appearance.compactMode || false}
              onChange={(e) => handleUpdateSetting('appearance', 'compactMode', e.target.checked)}
              className="sr-only"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
          </label>
        </div>
      </div>
    </div>
  );

  const SecuritySection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Cambiar contraseña
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contraseña actual
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Contraseña actual"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nueva contraseña
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nueva contraseña"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirmar contraseña
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar contraseña"
            />
          </div>
          
          <Button 
            variant="outline" 
            disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
          >
            Cambiar contraseña
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Autenticación de dos factores
        </h3>
        
        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              2FA {settings?.security.twoFactorEnabled ? 'Activado' : 'Desactivado'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {settings?.security.twoFactorEnabled 
                ? 'Tu cuenta está protegida con autenticación de dos factores'
                : 'Añade una capa extra de seguridad a tu cuenta'
              }
            </p>
          </div>
          <Button
            variant={settings?.security.twoFactorEnabled ? "outline" : "default"}
            onClick={() => handleUpdateSetting('security', 'twoFactorEnabled', !settings?.security.twoFactorEnabled)}
          >
            {settings?.security.twoFactorEnabled ? 'Desactivar' : 'Activar'}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Alertas de inicio de sesión
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings?.security.loginAlerts || false}
              onChange={(e) => handleUpdateSetting('security', 'loginAlerts', e.target.checked)}
              className="sr-only"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tiempo de espera de sesión (días)
          </label>
          <select
            value={settings?.security.sessionTimeout || 7}
            onChange={(e) => handleUpdateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value={1}>1 día</option>
            <option value={7}>7 días</option>
            <option value={30}>30 días</option>
            <option value={90}>90 días</option>
          </select>
        </div>
      </div>
    </div>
  );

  const SubscriptionSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Plan actual
        </h3>
        
        <Card className="p-6 border-2 border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Crown className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                  Plan Premium
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Próximo pago: {new Date(settings?.subscription.nextBilling || '').toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
            <Badge variant="default" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Activo
            </Badge>
          </div>
          
          <div className="space-y-2 mb-4">
            <p className="font-medium text-gray-900 dark:text-white">
              Funciones incluidas:
            </p>
            <ul className="space-y-1">
              {settings?.subscription.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Check className="w-4 h-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <CreditCard className="w-4 h-4 mr-2" />
              Actualizar plan
            </Button>
            <Button variant="outline" size="sm">
              Cancelar suscripción
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'profile': return <ProfileSection />;
      case 'notifications': return <NotificationsSection />;
      case 'privacy': return <PrivacySection />;
      case 'appearance': return <AppearanceSection />;
      case 'security': return <SecuritySection />;
      case 'subscription': return <SubscriptionSection />;
      default: return <ProfileSection />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="space-y-2">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-64" />
                <div className="space-y-4">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Configuración
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Personaliza tu experiencia en EventConnect
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={loadSettings}
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recargar
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={isSaving}
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Guardar cambios
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    {section.label}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              {renderSection()}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;











