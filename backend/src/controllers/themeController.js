const { User } = require('../models');

class ThemeController {
  // Obtener configuración de tema del usuario
  async getThemeConfig(req, res) {
    try {
      const userId = req.user.id;
      
      const user = await User.findById(userId).select('preferences.theme');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Configuración de tema por defecto si no existe
      const defaultTheme = {
        mode: 'dark',
        primaryColor: 'cyan',
        accentColor: 'purple',
        customColors: {
          primary: '#06b6d4',
          secondary: '#8b5cf6',
          accent: '#f59e0b',
          background: '#0f172a',
          surface: '#1e293b',
          text: '#f8fafc'
        },
        animations: true,
        reducedMotion: false,
        glassEffect: true,
        neonEffects: false,
        autoSync: true
      };

      const themeConfig = user.preferences?.theme || defaultTheme;

      res.json({
        success: true,
        data: {
          theme: themeConfig,
          lastUpdated: user.updatedAt
        }
      });
    } catch (error) {
      console.error('Error obteniendo configuración de tema:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar configuración de tema
  async updateThemeConfig(req, res) {
    try {
      const userId = req.user.id;
      const themeConfig = req.body;

      // Validar configuración de tema
      const validModes = ['light', 'dark', 'auto'];
      const validColors = ['cyan', 'purple', 'blue', 'green', 'orange', 'pink', 'red'];

      if (themeConfig.mode && !validModes.includes(themeConfig.mode)) {
        return res.status(400).json({
          success: false,
          message: 'Modo de tema inválido'
        });
      }

      if (themeConfig.primaryColor && !validColors.includes(themeConfig.primaryColor)) {
        return res.status(400).json({
          success: false,
          message: 'Color primario inválido'
        });
      }

      // Actualizar usuario
      const user = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'preferences.theme': {
              ...themeConfig,
              updatedAt: new Date()
            }
          }
        },
        { new: true, runValidators: true }
      ).select('preferences.theme');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Configuración de tema actualizada',
        data: {
          theme: user.preferences.theme,
          lastUpdated: user.updatedAt
        }
      });
    } catch (error) {
      console.error('Error actualizando configuración de tema:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener temas predefinidos
  async getPresetThemes(req, res) {
    try {
      const presetThemes = [
        {
          id: 'default-dark',
          name: 'Oscuro Predeterminado',
          description: 'Tema oscuro con acentos cian y púrpura',
          preview: '/api/themes/previews/default-dark.png',
          config: {
            mode: 'dark',
            primaryColor: 'cyan',
            accentColor: 'purple',
            customColors: {
              primary: '#06b6d4',
              secondary: '#8b5cf6',
              accent: '#f59e0b',
              background: '#0f172a',
              surface: '#1e293b',
              text: '#f8fafc'
            },
            animations: true,
            glassEffect: true,
            neonEffects: false
          }
        },
        {
          id: 'neon-cyber',
          name: 'Cyber Neon',
          description: 'Tema cyberpunk con efectos neon',
          preview: '/api/themes/previews/neon-cyber.png',
          config: {
            mode: 'dark',
            primaryColor: 'cyan',
            accentColor: 'pink',
            customColors: {
              primary: '#00ffff',
              secondary: '#ff00ff',
              accent: '#ffff00',
              background: '#000000',
              surface: '#111111',
              text: '#ffffff'
            },
            animations: true,
            glassEffect: false,
            neonEffects: true
          }
        },
        {
          id: 'minimal-light',
          name: 'Minimalista Claro',
          description: 'Tema claro y limpio',
          preview: '/api/themes/previews/minimal-light.png',
          config: {
            mode: 'light',
            primaryColor: 'blue',
            accentColor: 'green',
            customColors: {
              primary: '#2563eb',
              secondary: '#059669',
              accent: '#d97706',
              background: '#ffffff',
              surface: '#f8fafc',
              text: '#1e293b'
            },
            animations: true,
            glassEffect: false,
            neonEffects: false
          }
        },
        {
          id: 'sunset-gradient',
          name: 'Atardecer',
          description: 'Gradientes cálidos inspirados en el atardecer',
          preview: '/api/themes/previews/sunset-gradient.png',
          config: {
            mode: 'dark',
            primaryColor: 'orange',
            accentColor: 'red',
            customColors: {
              primary: '#ea580c',
              secondary: '#dc2626',
              accent: '#facc15',
              background: '#1c1917',
              surface: '#292524',
              text: '#fef3c7'
            },
            animations: true,
            glassEffect: true,
            neonEffects: false
          }
        },
        {
          id: 'forest-green',
          name: 'Bosque Verde',
          description: 'Tema natural con tonos verdes',
          preview: '/api/themes/previews/forest-green.png',
          config: {
            mode: 'dark',
            primaryColor: 'green',
            accentColor: 'blue',
            customColors: {
              primary: '#059669',
              secondary: '#0284c7',
              accent: '#84cc16',
              background: '#064e3b',
              surface: '#065f46',
              text: '#ecfdf5'
            },
            animations: true,
            glassEffect: true,
            neonEffects: false
          }
        }
      ];

      res.json({
        success: true,
        data: {
          themes: presetThemes,
          total: presetThemes.length
        }
      });
    } catch (error) {
      console.error('Error obteniendo temas predefinidos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Aplicar tema predefinido
  async applyPresetTheme(req, res) {
    try {
      const userId = req.user.id;
      const { themeId } = req.params;

      // Obtener temas predefinidos
      const presetResponse = await this.getPresetThemes(req, { json: () => {} });
      const presetThemes = [
        // Los mismos temas de arriba - simplificado para este ejemplo
        {
          id: 'default-dark',
          config: {
            mode: 'dark',
            primaryColor: 'cyan',
            accentColor: 'purple',
            customColors: {
              primary: '#06b6d4',
              secondary: '#8b5cf6',
              accent: '#f59e0b',
              background: '#0f172a',
              surface: '#1e293b',
              text: '#f8fafc'
            },
            animations: true,
            glassEffect: true,
            neonEffects: false
          }
        }
      ];

      const selectedTheme = presetThemes.find(theme => theme.id === themeId);

      if (!selectedTheme) {
        return res.status(404).json({
          success: false,
          message: 'Tema predefinido no encontrado'
        });
      }

      // Aplicar el tema
      const user = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'preferences.theme': {
              ...selectedTheme.config,
              appliedPreset: themeId,
              updatedAt: new Date()
            }
          }
        },
        { new: true, runValidators: true }
      ).select('preferences.theme');

      res.json({
        success: true,
        message: 'Tema aplicado correctamente',
        data: {
          theme: user.preferences.theme,
          appliedPreset: themeId
        }
      });
    } catch (error) {
      console.error('Error aplicando tema predefinido:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Sincronizar tema entre dispositivos
  async syncTheme(req, res) {
    try {
      const userId = req.user.id;
      const { deviceId, platform } = req.body;

      const user = await User.findById(userId).select('preferences.theme');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Registrar sincronización
      await User.findByIdAndUpdate(userId, {
        $push: {
          'preferences.theme.syncHistory': {
            deviceId,
            platform,
            syncedAt: new Date()
          }
        }
      });

      res.json({
        success: true,
        message: 'Tema sincronizado',
        data: {
          theme: user.preferences.theme,
          deviceId,
          platform
        }
      });
    } catch (error) {
      console.error('Error sincronizando tema:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

module.exports = new ThemeController();
